import type { AuthUser } from "@reynalds-os/auth";
import type { Document as PortalDocumentRecord, Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import {
  buildDocumentSendPackageName,
  buildDocumentSendPackageNextAction,
  documentSendPackageObjectType,
  DocumentSendPackageValidationError,
  getDocumentSendPackageHealth,
  type DocumentSendPackageInput,
  type DocumentSendPackageStatus,
  validateDocumentSendPackageInput
} from "../../../../lib/document-send-packages";
import { prisma } from "../../../../lib/db";
import { getPortalDocumentVersionLabel } from "../../../../lib/portal-documents";
import {
  buildPersistedPortalPlaybookSnapshot,
  buildPortalPlaybook
} from "../../../../lib/portal-playbook";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await assertPermission("document-workspace:view");
    const documentSendPackages = await prisma.rosObject.findMany({
      where: {
        workspaceId: actor.workspaceId,
        objectType: documentSendPackageObjectType,
        archivedAt: null
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 50
    });

    return NextResponse.json({ documentSendPackages });
  } catch (error) {
    return handleDocumentSendPackageError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await assertPermission("document-workspace:send");
    const input = validateDocumentSendPackageInput(await request.json());
    const documents = await prisma.document.findMany({
      where: {
        id: { in: input.documentIds },
        workspaceId: actor.workspaceId,
        archivedAt: null
      }
    });

    if (documents.length !== input.documentIds.length) {
      return NextResponse.json(
        { error: "One or more selected documents could not be found." },
        { status: 400 }
      );
    }

    const closedDocument = documents.find((document) =>
      ["Archived", "Superseded"].includes(document.status)
    );

    if (closedDocument) {
      return NextResponse.json(
        { error: "Archived or superseded documents cannot be added to a send package." },
        { status: 400 }
      );
    }

    if (["Sent", "Signature Monitoring", "Completed"].includes(input.status)) {
      return NextResponse.json(
        { error: "Create the send package before recording delivery or signature completion." },
        { status: 400 }
      );
    }

    const packageInput = {
      ...input,
      status: getSafeInitialSendPackageStatus(input, documents)
    };
    const relatedObject = await getRelatedWorkObject(actor, documents);
    const documentSummaries = documents.map(getDocumentSummary);
    const documentSendPackage = await prisma.$transaction(async (tx) => {
      const sendPackage = await tx.rosObject.create({
        data: {
          workspaceId: actor.workspaceId,
          objectType: documentSendPackageObjectType,
          name: buildDocumentSendPackageName(packageInput),
          status: packageInput.status,
          health: getDocumentSendPackageHealth(packageInput.status),
          ownerId: actor.id,
          clientUserId: getSingleValue(documents.map((document) => document.ownerId)),
          assignedStaffUserId: actor.id,
          nextAction: buildDocumentSendPackageNextAction(packageInput),
          data: buildDocumentSendPackageData(
            packageInput,
            actor,
            documentSummaries,
            relatedObject?.id
          )
        }
      });

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: sendPackage.id,
          actorId: actor.id,
          eventType: "document_send_package.created",
          summary: `Document send package prepared: ${packageInput.packageName}`,
          newValue: {
            documentIds: packageInput.documentIds,
            documentSendPackageId: sendPackage.id,
            packageName: packageInput.packageName,
            status: packageInput.status
          }
        }
      });

      if (relatedObject) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: relatedObject.id,
            actorId: actor.id,
            eventType: "document_send_package.created",
            summary: `Document send package prepared: ${packageInput.packageName}`,
            newValue: {
              deliveryChannel: packageInput.deliveryChannel,
              documentCount: packageInput.documentIds.length,
              documentSendPackageId: sendPackage.id,
              packageName: packageInput.packageName,
              status: packageInput.status
            }
          }
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.document_send_package.created",
          subjectType: "RosObject",
          subjectId: sendPackage.id,
          summary: `Document send package prepared: ${packageInput.packageName}`,
          metadata: {
            approvalConfirmed: packageInput.approvalConfirmed,
            deliveryChannel: packageInput.deliveryChannel,
            documentCount: packageInput.documentIds.length,
            hasNotes: Boolean(packageInput.notes),
            relatedObjectId: relatedObject?.id ?? null,
            signatureRequired: packageInput.signatureRequired,
            status: packageInput.status
          }
        }
      });

      return sendPackage;
    });

    return NextResponse.json({ documentSendPackage }, { status: 201 });
  } catch (error) {
    return handleDocumentSendPackageError(error);
  }
}

function getSafeInitialSendPackageStatus(
  input: DocumentSendPackageInput,
  documents: PortalDocumentRecord[]
): DocumentSendPackageStatus {
  const allDocumentsApproved = documents.every((document) =>
    ["Approved", "Sent"].includes(document.status)
  );

  if (!input.approvalConfirmed || !allDocumentsApproved) {
    return input.status === "Blocked" ? "Blocked" : "Approval Needed";
  }

  return input.status;
}

async function getRelatedWorkObject(actor: AuthUser, documents: PortalDocumentRecord[]) {
  const relatedObjectId = getSingleValue(documents.map((document) => document.relatedObjectId));

  if (!relatedObjectId) {
    return null;
  }

  return prisma.rosObject.findFirst({
    where: {
      id: relatedObjectId,
      workspaceId: actor.workspaceId,
      archivedAt: null
    }
  });
}

function getDocumentSummary(document: PortalDocumentRecord) {
  return {
    documentType: document.documentType,
    fileName: document.fileName,
    id: document.id,
    status: document.status,
    versionLabel: getPortalDocumentVersionLabel(document.versionNumber, document.versionLabel),
    versionNumber: document.versionNumber
  };
}

function getSingleValue(values: Array<string | null | undefined>): string | undefined {
  const uniqueValues = Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  );

  return uniqueValues.length === 1 ? uniqueValues[0] : undefined;
}

function buildDocumentSendPackageData(
  input: DocumentSendPackageInput,
  actor: AuthUser,
  documents: ReturnType<typeof getDocumentSummary>[],
  relatedObjectId?: string
): Prisma.InputJsonObject {
  const data: Record<string, unknown> = {
    approvalConfirmed: input.approvalConfirmed,
    deliveryChannel: input.deliveryChannel,
    documentIds: input.documentIds,
    documents,
    packageName: input.packageName,
    recipientSummary: input.recipientSummary,
    requestedByEmail: actor.email,
    requestedByUserId: actor.id,
    signatureRequired: input.signatureRequired
  };

  if (input.notes) {
    data.notes = input.notes;
  }

  if (input.requestedSendTiming) {
    data.requestedSendTiming = input.requestedSendTiming;
  }

  if (relatedObjectId) {
    data.relatedObjectId = relatedObjectId;
  }

  const playbook = buildPortalPlaybook({
    data: {
      ...data,
      serviceName: "Contract & Document Support"
    },
    name: buildDocumentSendPackageName(input),
    objectType: "Document"
  });

  if (playbook) {
    data.playbook = buildPersistedPortalPlaybookSnapshot(
      playbook
    );
  }

  return data as Prisma.InputJsonObject;
}

function handleDocumentSendPackageError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof DocumentSendPackageValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Document send package storage is temporarily unavailable." },
      { status: 503 }
    );
  }

  throw error;
}

function isDatabaseUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "PrismaClientInitializationError" ||
      error.message.includes("Can't reach database server") ||
      error.message.includes("ECONNREFUSED"))
  );
}
