import type { AuthUser } from "@reynalds-os/auth";
import type { Prisma } from "@reynalds-os/database";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import {
  buildDocumentSendPackageStatusNextAction,
  documentSendPackageObjectType,
  documentSendPackageStatusRequiresApproval,
  DocumentSendPackageValidationError,
  getDocumentSendPackageHealth,
  isDocumentSendPackageApprovalConfirmed,
  validateDocumentSendPackageStatusUpdateInput
} from "../../../../../../lib/document-send-packages";
import { prisma } from "../../../../../../lib/db";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("document-workspace:send");
    const { id } = await params;
    const input = validateDocumentSendPackageStatusUpdateInput(await request.json());
    const sendPackage = await prisma.rosObject.findFirst({
      where: {
        archivedAt: null,
        id,
        objectType: documentSendPackageObjectType,
        workspaceId: actor.workspaceId
      }
    });

    if (!sendPackage) {
      return NextResponse.json({ error: "Document send package not found." }, { status: 404 });
    }

    if (
      documentSendPackageStatusRequiresApproval(input.status) &&
      !isDocumentSendPackageApprovalConfirmed(sendPackage.data)
    ) {
      return NextResponse.json(
        { error: "Realtor approval must be recorded before this package can be sent or completed." },
        { status: 400 }
      );
    }

    const signatureRequired = getBooleanDataValue(sendPackage.data, "signatureRequired");
    const nextData = buildSendPackageStatusData(sendPackage.data, input, actor);
    const previousValue = {
      data: sendPackage.data,
      health: sendPackage.health,
      nextAction: sendPackage.nextAction,
      status: sendPackage.status
    };
    const updatedSendPackage = await prisma.$transaction(async (tx) => {
      const updated = await tx.rosObject.update({
        where: { id: sendPackage.id },
        data: {
          data: nextData,
          health: getDocumentSendPackageHealth(input.status),
          nextAction: buildDocumentSendPackageStatusNextAction(input.status, signatureRequired),
          status: input.status
        }
      });
      const newValue = {
        deliveryConfirmation: input.deliveryConfirmation ?? null,
        hasNotes: Boolean(input.notes),
        status: input.status
      };

      await tx.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: sendPackage.id,
          actorId: actor.id,
          eventType: "document_send_package.status.updated",
          summary: `Document send package status updated: ${sendPackage.name} is ${input.status}`,
          previousValue,
          newValue
        }
      });

      const relatedObjectId = getStringDataValue(sendPackage.data, "relatedObjectId");

      if (relatedObjectId) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: relatedObjectId,
            actorId: actor.id,
            eventType: "document_send_package.status.updated",
            summary: `Document send package status updated: ${sendPackage.name} is ${input.status}`,
            previousValue: {
              documentSendPackageId: sendPackage.id,
              status: sendPackage.status
            },
            newValue: {
              documentSendPackageId: sendPackage.id,
              status: input.status
            }
          }
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.document_send_package.status.updated",
          subjectType: "RosObject",
          subjectId: sendPackage.id,
          summary: `Document send package status updated: ${sendPackage.name} is ${input.status}`,
          metadata: {
            deliveryConfirmation: input.deliveryConfirmation ?? null,
            hasNotes: Boolean(input.notes),
            previousStatus: sendPackage.status,
            status: input.status
          }
        }
      });

      return updated;
    });

    return NextResponse.json({ documentSendPackage: updatedSendPackage });
  } catch (error) {
    return handleDocumentSendPackageStatusError(error);
  }
}

function buildSendPackageStatusData(
  currentData: unknown,
  input: ReturnType<typeof validateDocumentSendPackageStatusUpdateInput>,
  actor: AuthUser
): Prisma.InputJsonObject {
  const data =
    currentData && typeof currentData === "object" && !Array.isArray(currentData)
      ? { ...(currentData as Record<string, unknown>) }
      : {};

  data.deliveryStatus = input.status;
  data.statusUpdatedAt = new Date().toISOString();
  data.statusUpdatedByEmail = actor.email;
  data.statusUpdatedByUserId = actor.id;

  if (input.deliveryConfirmation) {
    data.deliveryConfirmation = input.deliveryConfirmation;
  }

  if (input.notes) {
    data.lastStatusNote = input.notes;
  }

  return data as Prisma.InputJsonObject;
}

function getBooleanDataValue(data: unknown, key: string): boolean {
  return Boolean(
    data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      (data as Record<string, unknown>)[key] === true
  );
}

function getStringDataValue(data: unknown, key: string): string | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return undefined;
  }

  const value = (data as Record<string, unknown>)[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function handleDocumentSendPackageStatusError(error: unknown) {
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
