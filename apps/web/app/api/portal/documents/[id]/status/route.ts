import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  PortalDocumentValidationError,
  type PortalDocumentWorkflowStatus,
  validatePortalDocumentStatusUpdateInput
} from "../../../../../../lib/portal-documents";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

const statusPermissionMap: Record<PortalDocumentWorkflowStatus, Permission> = {
  Approved: "document-workspace:approval:record",
  Archived: "document-workspace:drafts:update",
  "In Review": "document-workspace:drafts:update",
  "Ready for Client Review": "document-workspace:approval:request",
  "Revision Requested": "document-workspace:drafts:update",
  Sent: "document-workspace:send",
  Uploaded: "document-workspace:drafts:update"
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("document-workspace:view");
    const { id } = await params;
    const input = validatePortalDocumentStatusUpdateInput(await request.json());
    assertDocumentStatusPermission(actor, input.status);

    const document = await prisma.document.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        archivedAt: null
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const previousValue = {
      notes: document.notes,
      requestedAction: document.requestedAction,
      status: document.status
    };
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        notes: input.notes ?? document.notes,
        requestedAction: input.requestedAction ?? document.requestedAction,
        status: input.status
      }
    });
    const newValue = {
      notes: updatedDocument.notes,
      requestedAction: updatedDocument.requestedAction,
      status: updatedDocument.status
    };

    if (document.relatedObjectId) {
      await prisma.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: document.relatedObjectId,
          actorId: actor.id,
          eventType: "portal_document.status.updated",
          summary: `Document status updated: ${document.documentType} is ${input.status}`,
          previousValue,
          newValue: {
            documentId: updatedDocument.id,
            documentType: updatedDocument.documentType,
            ...newValue
          }
        }
      });
    }

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.document.status.updated",
        subjectType: "Document",
        subjectId: updatedDocument.id,
        summary: `Document status updated: ${updatedDocument.documentType} is ${input.status}`,
        metadata: {
          documentType: updatedDocument.documentType,
          fileName: updatedDocument.fileName,
          hasUpdateNote: Boolean(input.notes),
          previousRequestedAction: document.requestedAction ?? null,
          previousStatus: document.status,
          requestedAction: updatedDocument.requestedAction ?? null,
          status: updatedDocument.status
        }
      }
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    return handlePortalDocumentStatusError(error);
  }
}

function assertDocumentStatusPermission(actor: AuthUser, status: PortalDocumentWorkflowStatus) {
  const requiredPermission = statusPermissionMap[status];

  if (!actor.permissions.includes(requiredPermission)) {
    throw new PermissionDeniedError(requiredPermission);
  }
}

function handlePortalDocumentStatusError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalDocumentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Document workflow storage is temporarily unavailable." },
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
