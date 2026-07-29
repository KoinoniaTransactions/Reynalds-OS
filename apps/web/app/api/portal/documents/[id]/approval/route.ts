import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  PortalDocumentValidationError,
  type PortalDocumentClientApprovalAction,
  type PortalDocumentWorkflowStatus,
  validatePortalDocumentClientApprovalInput
} from "../../../../../../lib/portal-documents";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

const clientVisibleDocumentAccessLevels = ["client", "client_and_staff"] as const;

export async function PATCH(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("client-portal:documents:approve");
    const { id } = await params;
    const input = validatePortalDocumentClientApprovalInput(await request.json());

    const document = await prisma.document.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        ownerId: actor.id,
        archivedAt: null,
        accessLevel: {
          in: [...clientVisibleDocumentAccessLevels]
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    if (document.status !== "Ready for Client Review") {
      return NextResponse.json(
        { error: "Document is not ready for client approval." },
        { status: 400 }
      );
    }

    const nextStatus = getApprovalStatus(input.action);
    const nextRequestedAction = getApprovalRequestedAction(input.action);
    const previousValue = {
      notes: document.notes,
      requestedAction: document.requestedAction,
      status: document.status
    };
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        notes: appendDocumentNote(document.notes, getApprovalNoteLabel(input.action), input.notes),
        requestedAction: nextRequestedAction,
        status: nextStatus
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
          eventType: "portal_document.client_response.recorded",
          summary: `Client response recorded: ${document.documentType} is ${nextStatus}`,
          previousValue,
          newValue: {
            action: input.action,
            documentId: updatedDocument.id,
            documentType: updatedDocument.documentType,
            hasClientNote: Boolean(input.notes),
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
        action: "portal.document.client_response.recorded",
        subjectType: "Document",
        subjectId: updatedDocument.id,
        summary: `Client response recorded: ${updatedDocument.documentType} is ${nextStatus}`,
        metadata: {
          approvalAction: input.action,
          documentType: updatedDocument.documentType,
          fileName: updatedDocument.fileName,
          hasClientNote: Boolean(input.notes),
          previousStatus: document.status,
          requestedAction: updatedDocument.requestedAction,
          status: updatedDocument.status
        }
      }
    });

    return NextResponse.json({
      approval: {
        action: input.action,
        status: nextStatus
      },
      document: updatedDocument
    });
  } catch (error) {
    return handlePortalDocumentApprovalError(error);
  }
}

function getApprovalStatus(
  action: PortalDocumentClientApprovalAction
): Extract<PortalDocumentWorkflowStatus, "Approved" | "Revision Requested"> {
  return action === "approve" ? "Approved" : "Revision Requested";
}

function getApprovalRequestedAction(action: PortalDocumentClientApprovalAction): string {
  return action === "approve"
    ? "Koinonia can continue the next approved document step."
    : "Review the client revision request before sending this document.";
}

function getApprovalNoteLabel(action: PortalDocumentClientApprovalAction): string {
  return action === "approve" ? "Client approval note" : "Client revision request";
}

function appendDocumentNote(
  existingNote: string | null,
  label: string,
  note: string | undefined
): string | null {
  if (!note) {
    return existingNote;
  }

  const entry = `${label}: ${note}`;
  const existingText = existingNote?.trim();

  return existingText ? `${existingText}\n\n${entry}` : entry;
}

function handlePortalDocumentApprovalError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalDocumentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Document approval storage is temporarily unavailable." },
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
