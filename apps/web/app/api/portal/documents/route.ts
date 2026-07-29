import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../lib/api-auth";
import { assertPermission } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import {
  buildPortalDocumentDisplayName,
  PortalDocumentValidationError,
  validatePortalDocumentSubmission
} from "../../../../lib/portal-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StoredPortalDocument = {
  fileUrl: string;
  localPath: string;
  storageKey: string;
};

export async function GET() {
  try {
    const actor = await assertAnyPermission([
      "client-portal:documents:view",
      "document-workspace:view"
    ]);
    const canViewWorkspaceQueue = canViewAllDocuments(actor);

    const documents = await prisma.document.findMany({
      where: {
        workspaceId: actor.workspaceId,
        archivedAt: null,
        ...(canViewWorkspaceQueue ? {} : { ownerId: actor.id })
      },
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
  let storedDocument: StoredPortalDocument | null = null;

  try {
    const actor = await assertAnyPermission([
      "client-portal:documents:upload",
      "document-workspace:drafts:create"
    ]);
    const uploadRoot = getConfiguredUploadRoot();

    if (!uploadRoot) {
      return NextResponse.json(
        { error: "Document storage is not configured for uploads." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = getFormFile(formData, "file");
    const input = validatePortalDocumentSubmission({
      documentType: formData.get("documentType"),
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      notes: formData.get("notes"),
      relatedObjectId: formData.get("relatedObjectId"),
      requestedAction: formData.get("requestedAction"),
      transactionName: formData.get("transactionName")
    });

    if (input.relatedObjectId) {
      const relatedObject = await prisma.rosObject.findFirst({
        where: {
          id: input.relatedObjectId,
          workspaceId: actor.workspaceId,
          archivedAt: null
        },
        select: { id: true }
      });

      if (!relatedObject) {
        return NextResponse.json({ error: "Related work item was not found." }, { status: 404 });
      }
    }

    storedDocument = await persistPortalDocumentFile({
      actor,
      cleanName: input.file.cleanName,
      file,
      uploadRoot
    });

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
          newValue: {
            documentId: document.id,
            documentType: input.documentType,
            fileName: input.file.cleanName
          }
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
          requestSource: actor.role === "Client" ? "client-portal" : "employee-portal"
        }
      }
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (storedDocument && !documentPersisted) {
      await removeStoredFileQuietly(storedDocument.localPath);
    }

    return handlePortalDocumentError(error);
  }
}

async function assertAnyPermission(permissions: Permission[]): Promise<AuthUser> {
  let permissionDeniedError: PermissionDeniedError | null = null;

  for (const permission of permissions) {
    try {
      return await assertPermission(permission);
    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        permissionDeniedError = error;
        continue;
      }

      throw error;
    }
  }

  throw permissionDeniedError ?? new PermissionDeniedError(permissions[0]);
}

function canViewAllDocuments(actor: AuthUser): boolean {
  return actor.role !== "Client" && actor.permissions.includes("document-workspace:view");
}

function getConfiguredUploadRoot(): string | null {
  const configuredRoot = process.env.PORTAL_DOCUMENT_UPLOAD_DIR;

  if (!configuredRoot?.trim()) {
    return null;
  }

  return resolve(configuredRoot);
}

function getFormFile(formData: FormData, fieldName: string): File {
  const file = formData.get(fieldName);

  if (!(file instanceof File)) {
    throw new PortalDocumentValidationError("A document file is required.");
  }

  return file;
}

async function persistPortalDocumentFile({
  actor,
  cleanName,
  file,
  uploadRoot
}: {
  actor: AuthUser;
  cleanName: string;
  file: File;
  uploadRoot: string;
}): Promise<StoredPortalDocument> {
  const workspaceSegment = getSafeStorageSegment(actor.workspaceId);
  const storageFileName = `${randomUUID()}-${cleanName}`;
  const storageKey = `${workspaceSegment}/${storageFileName}`;
  const localPath = join(uploadRoot, workspaceSegment, storageFileName);

  await mkdir(dirname(localPath), { recursive: true });
  await writeFile(localPath, Buffer.from(await file.arrayBuffer()), { mode: 0o600 });

  return {
    fileUrl: `portal-document://${storageKey}`,
    localPath,
    storageKey
  };
}

function getSafeStorageSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 80) || "workspace";
}

async function removeStoredFileQuietly(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // Best-effort cleanup only; the request still returns the real failure.
  }
}

function handlePortalDocumentError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalDocumentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isDatabaseUnavailableError(error)) {
    return NextResponse.json({ error: "Document storage is temporarily unavailable." }, { status: 503 });
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
