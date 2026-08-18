import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  PortalDocumentValidationError,
  validatePortalDocumentRemovalInput
} from "../../../../../../lib/portal-documents";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const actor = await assertPermission("client-portal:documents:upload");
    const { id } = await params;
    const input = validatePortalDocumentRemovalInput(await readOptionalJson(request));

    const document = await prisma.document.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        ownerId: actor.id,
        archivedAt: null,
        removedAt: null
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document was not found or is already removed." },
        { status: 404 }
      );
    }

    const removedAt = new Date();
    const removalReason = input.reason ?? "Removed from the client Document Center";

    const removedDocument = await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: document.id },
        data: {
          lifecycleState: "removed",
          removedAt,
          removedByUserId: actor.id,
          removalReason
        }
      });

      if (document.relatedObjectId) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: document.relatedObjectId,
            actorId: actor.id,
            eventType: "portal_document.removed",
            summary: `Document removed from portal: ${document.documentType}`,
            previousValue: {
              documentId: document.id,
              fileName: document.fileName,
              removedAt: document.removedAt,
              status: document.status
            },
            newValue: {
              documentId: updated.id,
              fileName: updated.fileName,
              removalReason,
              removedAt
            }
          }
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.document.removed",
          subjectType: "Document",
          subjectId: updated.id,
          summary: `Document removed from portal: ${updated.documentType}`,
          metadata: {
            documentType: updated.documentType,
            fileName: updated.fileName,
            relatedObjectId: updated.relatedObjectId ?? null,
            removalReason,
            removedAt: removedAt.toISOString(),
            requestSource: "client-portal",
            storageKey: updated.storageKey ?? null
          }
        }
      });

      return updated;
    });

    return NextResponse.json({ document: removedDocument });
  } catch (error) {
    return handlePortalDocumentRemovalError(error);
  }
}

async function readOptionalJson(request: Request): Promise<unknown> {
  const body = await request.text();

  if (!body.trim()) {
    return undefined;
  }

  return JSON.parse(body);
}

function handlePortalDocumentRemovalError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalDocumentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: "Document removal request must contain valid JSON." },
      { status: 400 }
    );
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Document removal is temporarily unavailable." },
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
