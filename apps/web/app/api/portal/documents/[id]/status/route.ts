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
  Superseded: "document-workspace:drafts:update",
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

    if (document.supersededByDocumentId || document.lifecycleState === "superseded") {
      return NextResponse.json(
        { error: "Update the current document version instead of a superseded version." },
        { status: 409 }
      );
    }

    const previousValue = {
      notes: document.notes,
      requestedAction: document.requestedAction,
      status: document.status
    };

    const updatedDocument = await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: document.id },
        data: {
          notes: input.notes ?? document.notes,
          requestedAction: input.requestedAction ?? document.requestedAction,
          status: input.status
        }
      });

      if (document.relatedObjectId) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: document.relatedObjectId,
            actorId: actor.id,
            eventType: "portal_document.status.updated",
            summary: `Document status updated: ${document.documentType} is ${input.status}`,
            previousValue,
            newValue: {
              documentId: updated.id,
              documentType: updated.documentType,
              notes: updated.notes,
              requestedAction: updated.requestedAction,
              status: updated.status,
              versionNumber: updated.versionNumber
            }
          }
        });
      }

      if (
        input.status === "Ready for Client Review" &&
        document.status !== "Ready for Client Review" &&
        document.relatedObjectId
      ) {
        const transaction = await tx.rosObject.findFirst({
          where: {
            id: document.relatedObjectId,
            workspaceId: actor.workspaceId,
            archivedAt: null
          },
          select: {
            id: true,
            clientUserId: true,
            ownerId: true,
            name: true
          }
        });
        const realtorUserId = transaction?.clientUserId ?? transaction?.ownerId ?? null;

        if (transaction && realtorUserId) {
          await tx.notification.create({
            data: {
              workspaceId: actor.workspaceId,
              userId: realtorUserId,
              relatedObjectId: transaction.id,
              level: "info",
              title: "Document ready for review",
              message: `${document.documentType} is ready for a quick accuracy review. Koinonia will handle the next step after you respond.`,
              status: "unread"
            }
          });
        }
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.document.status.updated",
          subjectType: "Document",
          subjectId: updated.id,
          summary: `Document status updated: ${updated.documentType} is ${input.status}`,
          metadata: {
            documentType: updated.documentType,
            fileName: updated.fileName,
            hasUpdateNote: Boolean(input.notes),
            previousRequestedAction: document.requestedAction ?? null,
            previousStatus: document.status,
            requestedAction: updated.requestedAction ?? null,
            status: updated.status,
            versionNumber: updated.versionNumber
          }
        }
      });

      return updated;
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
