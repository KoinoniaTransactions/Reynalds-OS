import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  getConfiguredPortalDocumentScannerCommand,
  getConfiguredPortalDocumentUploadRoot,
  getPortalDocumentFormFile,
  PortalDocumentScanFailedError,
  PortalDocumentScanUnavailableError,
  scanPortalDocumentUpload
} from "../../../../lib/portal-document-storage";
import {
  isPortalDocumentR2UploadEnabled,
  persistPortalDocumentToR2,
  removePortalDocumentFromR2Quietly,
  type StoredR2Document
} from "../../../../lib/portal-document-r2";
import {
  buildPortalDocumentDisplayName,
  PortalDocumentValidationError,
  validatePortalDocumentSubmission
} from "../../../../lib/portal-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PortalDocumentScanStatus = "scanned" | "preview-bypassed";

export async function GET() {
  try {
    const actor = await assertAnyPermission(["client-portal:documents:view", "document-workspace:view"]);
    const canViewWorkspaceQueue = actor.role !== "Client" && actor.permissions.includes("document-workspace:view");
    const documents = await prisma.document.findMany({
      where: { workspaceId: actor.workspaceId, archivedAt: null, ...(canViewWorkspaceQueue ? {} : { ownerId: actor.id }) },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 50
    });
    return NextResponse.json({ documents });
  } catch (error) {
    return handlePortalDocumentError(error);
  }
}

export async function POST(request: Request) {
  let documentPersisted = false;
  let storedDocument: StoredR2Document | null = null;
  try {
    const actor = await assertAnyPermission(["client-portal:documents:upload", "document-workspace:drafts:create"]);
    if (!isPortalDocumentR2UploadEnabled()) {
      return NextResponse.json({ error: "Cloudflare R2 uploads are not enabled for this environment." }, { status: 503 });
    }

    const formData = await request.formData();
    const file = getPortalDocumentFormFile(formData, "file");
    const input = validatePortalDocumentSubmission({
      documentType: formData.get("documentType"),
      file: { name: file.name, size: file.size, type: file.type },
      notes: formData.get("notes"),
      relatedObjectId: formData.get("relatedObjectId"),
      requestedAction: formData.get("requestedAction"),
      transactionName: formData.get("transactionName")
    });

    if (input.relatedObjectId) {
      const relatedObject = await prisma.rosObject.findFirst({
        where: { id: input.relatedObjectId, workspaceId: actor.workspaceId, archivedAt: null },
        select: { id: true, clientUserId: true, ownerId: true }
      });
      if (!relatedObject) return NextResponse.json({ error: "Related work item was not found." }, { status: 404 });
      if (actor.role === "Client" && relatedObject.clientUserId !== actor.id && relatedObject.ownerId !== actor.id) {
        return NextResponse.json({ error: "Related work item was not found." }, { status: 404 });
      }
    }

    const scanStatus = await scanRequestedDocumentUpload({ actor, cleanName: input.file.cleanName, file });
    storedDocument = await persistPortalDocumentToR2({ actor, cleanName: input.file.cleanName, file });

    const document = await prisma.document.create({
      data: {
        workspaceId: actor.workspaceId,
        relatedObjectId: input.relatedObjectId,
        ownerId: actor.id,
        uploadedByUserId: actor.id,
        fileName: input.file.cleanName,
        fileUrl: storedDocument.fileUrl,
        storageKey: storedDocument.storageKey,
        fileSizeBytes: input.file.size,
        mimeType: input.file.mimeType,
        documentType: input.documentType,
        status: "Uploaded",
        requestedAction: input.requestedAction,
        notes: input.notes,
        accessLevel: "client_and_staff"
      }
    });
    documentPersisted = true;

    if (input.relatedObjectId) {
      await prisma.timelineEvent.create({
        data: {
          workspaceId: actor.workspaceId,
          objectId: input.relatedObjectId,
          actorId: actor.id,
          eventType: "document.uploaded",
          summary: `Document uploaded: ${input.documentType}`,
          newValue: { documentId: document.id, documentType: input.documentType, fileName: input.file.cleanName, scanStatus }
        }
      });
    }

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: "portal.document.uploaded",
        subjectType: "Document",
        subjectId: document.id,
        summary: `Document uploaded: ${buildPortalDocumentDisplayName(input)}`,
        metadata: {
          documentType: input.documentType,
          fileName: input.file.cleanName,
          fileSizeBytes: input.file.size,
          mimeType: input.file.mimeType,
          relatedObjectId: input.relatedObjectId ?? null,
          requestSource: actor.role === "Client" ? "client-portal" : "employee-portal",
          scanStatus
        }
      }
    });

    return NextResponse.json({ document, scanStatus }, { status: 201 });
  } catch (error) {
    if (storedDocument && !documentPersisted) await removePortalDocumentFromR2Quietly(storedDocument.storageKey);
    return handlePortalDocumentError(error);
  }
}

async function scanRequestedDocumentUpload({ actor, cleanName, file }: { actor: AuthUser; cleanName: string; file: File }): Promise<PortalDocumentScanStatus> {
  const uploadRoot = getConfiguredPortalDocumentUploadRoot();
  const scannerCommand = getConfiguredPortalDocumentScannerCommand();
  if (!uploadRoot || !scannerCommand) {
    if (process.env.VERCEL_ENV === "preview") return "preview-bypassed";
    throw new PortalDocumentScanUnavailableError("Document malware scanning is temporarily unavailable.");
  }
  try {
    await scanPortalDocumentUpload({ cleanName, file, scannerCommand, uploadRoot, workspaceId: actor.workspaceId });
    return "scanned";
  } catch (error) {
    if (error instanceof PortalDocumentScanUnavailableError && process.env.VERCEL_ENV === "preview") return "preview-bypassed";
    throw error;
  }
}

async function assertAnyPermission(permissions: Permission[]): Promise<AuthUser> {
  let permissionDeniedError: PermissionDeniedError | null = null;
  for (const permission of permissions) {
    try { return await assertPermission(permission); }
    catch (error) {
      if (error instanceof PermissionDeniedError) { permissionDeniedError = error; continue; }
      throw error;
    }
  }
  throw permissionDeniedError ?? new PermissionDeniedError(permissions[0]);
}

function handlePortalDocumentError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);
  if (authResponse) return authResponse;
  if (error instanceof PortalDocumentValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
  if (error instanceof PortalDocumentScanUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 });
  if (error instanceof PortalDocumentScanFailedError) return NextResponse.json({ error: error.message }, { status: 400 });
  if (error instanceof Error && (error.name === "PrismaClientInitializationError" || error.message.includes("Can't reach database server") || error.message.includes("ECONNREFUSED"))) {
    return NextResponse.json({ error: "Document storage is temporarily unavailable." }, { status: 503 });
  }
  throw error;
}
