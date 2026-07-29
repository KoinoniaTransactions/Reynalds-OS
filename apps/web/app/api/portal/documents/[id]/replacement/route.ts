import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  getConfiguredPortalDocumentScannerCommand,
  getConfiguredPortalDocumentUploadRoot,
  getPortalDocumentFormFile,
  persistPortalDocumentFile,
  PortalDocumentScanFailedError,
  PortalDocumentScanUnavailableError,
  removeStoredFileQuietly,
  scanPortalDocumentFile,
  type StoredPortalDocument
} from "../../../../../../lib/portal-document-storage";
import {
  getNextPortalDocumentVersionNumber,
  PortalDocumentValidationError,
  validatePortalDocumentReplacementSubmission
} from "../../../../../../lib/portal-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  let documentPersisted = false;
  let storedDocument: StoredPortalDocument | null = null;

  try {
    const actor = await assertPermission("document-workspace:drafts:update");
    const { id } = await params;
    const uploadRoot = getConfiguredPortalDocumentUploadRoot();

    if (!uploadRoot) {
      return NextResponse.json(
        { error: "Document storage is not configured for replacements." },
        { status: 503 }
      );
    }

    const scannerCommand = getConfiguredPortalDocumentScannerCommand();

    if (!scannerCommand) {
      return NextResponse.json(
        { error: "Document malware scanning is not configured for replacements." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = getPortalDocumentFormFile(formData, "file");
    const input = validatePortalDocumentReplacementSubmission({
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      notes: formData.get("notes"),
      replacementReason: formData.get("replacementReason"),
      requestedAction: formData.get("requestedAction"),
      versionLabel: formData.get("versionLabel")
    });

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

    if (document.supersededByDocumentId || document.status === "Superseded") {
      return NextResponse.json(
        { error: "A superseded document version cannot be replaced." },
        { status: 400 }
      );
    }

    if (document.status === "Archived") {
      return NextResponse.json(
        { error: "Archived documents cannot be replaced from the portal workspace." },
        { status: 400 }
      );
    }

    storedDocument = await persistPortalDocumentFile({
      actor,
      cleanName: input.file.cleanName,
      file,
      uploadRoot
    });
    await scanPortalDocumentFile(storedDocument.localPath, scannerCommand);

    const storedReplacement = storedDocument;
    const nextVersionNumber = getNextPortalDocumentVersionNumber(document.versionNumber);
    const replacementDocument = await prisma.$transaction(async (tx) => {
      const replacement = await tx.document.create({
        data: {
          workspaceId: document.workspaceId,
          relatedObjectId: document.relatedObjectId,
          ownerId: document.ownerId,
          uploadedByUserId: actor.id,
          fileName: input.file.cleanName,
          fileUrl: storedReplacement.fileUrl,
          storageKey: storedReplacement.storageKey,
          fileSizeBytes: input.file.size,
          mimeType: input.file.mimeType,
          documentType: document.documentType,
          status: "In Review",
          requestedAction: input.requestedAction,
          notes: input.notes,
          accessLevel: document.accessLevel,
          versionNumber: nextVersionNumber,
          versionLabel: input.versionLabel,
          previousDocumentId: document.id,
          replacementReason: input.replacementReason
        }
      });

      await tx.document.update({
        where: { id: document.id },
        data: {
          requestedAction: `Superseded by document version ${nextVersionNumber}.`,
          status: "Superseded",
          supersededAt: new Date(),
          supersededByDocumentId: replacement.id
        }
      });

      if (document.relatedObjectId) {
        await tx.timelineEvent.create({
          data: {
            workspaceId: actor.workspaceId,
            objectId: document.relatedObjectId,
            actorId: actor.id,
            eventType: "portal_document.version.replaced",
            summary: `Document version replaced: ${document.documentType} v${nextVersionNumber}`,
            previousValue: {
              documentId: document.id,
              fileName: document.fileName,
              status: document.status,
              versionNumber: document.versionNumber
            },
            newValue: {
              documentId: replacement.id,
              fileName: replacement.fileName,
              replacementReason: input.replacementReason,
              status: replacement.status,
              versionLabel: replacement.versionLabel,
              versionNumber: replacement.versionNumber
            }
          }
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          actorId: actor.id,
          actorEmail: actor.email,
          action: "portal.document.version.replaced",
          subjectType: "Document",
          subjectId: replacement.id,
          summary: `Document version replaced: ${document.documentType} v${nextVersionNumber}`,
          metadata: {
            documentType: document.documentType,
            fileName: replacement.fileName,
            hasReplacementNote: Boolean(input.notes),
            previousDocumentId: document.id,
            previousFileName: document.fileName,
            replacementReason: input.replacementReason,
            versionLabel: replacement.versionLabel,
            versionNumber: replacement.versionNumber
          }
        }
      });

      return replacement;
    });
    documentPersisted = true;

    return NextResponse.json({ document: replacementDocument }, { status: 201 });
  } catch (error) {
    if (storedDocument && !documentPersisted) {
      await removeStoredFileQuietly(storedDocument.localPath);
    }

    return handlePortalDocumentReplacementError(error);
  }
}

function handlePortalDocumentReplacementError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalDocumentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof PortalDocumentScanUnavailableError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof PortalDocumentScanFailedError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json(
      { error: "Document replacement storage is temporarily unavailable." },
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
