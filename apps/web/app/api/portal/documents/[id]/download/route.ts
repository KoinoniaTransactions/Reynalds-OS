import { getPortalDocumentFromR2, isPortalDocumentR2Configured } from "../../../../../../lib/portal-document-r2";
import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import { NextResponse } from "next/server";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { assertPermission } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/db";
import {
  buildPortalDocumentContentDisposition,
  PortalDocumentValidationError,
  validatePortalDocumentStorageKey
} from "../../../../../../lib/portal-documents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const actor = await assertAnyPermission([
      "client-portal:documents:view",
      "document-workspace:view"
    ]);
    const { id } = await params;
    const disposition = getRequestedDisposition(request);
    if (!isPortalDocumentR2Configured()) {
      return NextResponse.json(
        { error: "Cloudflare R2 document storage is not configured for downloads." },
        { status: 503 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        id,
        workspaceId: actor.workspaceId,
        archivedAt: null,
        ...(canViewAllDocuments(actor) ? {} : { ownerId: actor.id })
      }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const storageKey = validatePortalDocumentStorageKey(document.storageKey);
    const fileBuffer = await getPortalDocumentFromR2(storageKey);

    const isInlinePreview = disposition === "inline";

    await prisma.auditEvent.create({
      data: {
        workspaceId: actor.workspaceId,
        actorId: actor.id,
        actorEmail: actor.email,
        action: isInlinePreview
          ? "portal.document.previewed"
          : "portal.document.downloaded",
        subjectType: "Document",
        subjectId: document.id,
        summary: isInlinePreview
          ? `Document previewed: ${document.fileName}`
          : `Document downloaded: ${document.fileName}`,
        metadata: {
          disposition,
          documentType: document.documentType,
          fileName: document.fileName,
          mimeType: document.mimeType ?? null,
          requestSource:
            actor.role === "Client" ? "client-portal" : "employee-portal",
          storageKey
        }
      }
    });

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": buildRequestedContentDisposition(
          document.fileName,
          disposition
        ),
        "Content-Type": document.mimeType ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    return handlePortalDocumentDownloadError(error);
  }
}

type PortalDocumentDisposition = "attachment" | "inline";

function getRequestedDisposition(
  request: Request
): PortalDocumentDisposition {
  const value = new URL(request.url).searchParams.get("disposition");

  return value === "inline" ? "inline" : "attachment";
}

function buildRequestedContentDisposition(
  fileName: string,
  disposition: PortalDocumentDisposition
): string {
  const attachment = buildPortalDocumentContentDisposition(fileName);

  if (disposition === "attachment") {
    return attachment;
  }

  return attachment.replace(/^attachment/i, "inline");
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

function handlePortalDocumentDownloadError(error: unknown) {
  const authResponse = getAuthErrorResponse(error);

  if (authResponse) {
    return authResponse;
  }

  if (error instanceof PortalDocumentValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (isFileNotFoundError(error)) {
    return NextResponse.json({ error: "Stored document file was not found." }, { status: 404 });
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

function isFileNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    ("name" in error &&
      ((error as { name?: unknown }).name === "NoSuchKey" ||
        (error as { name?: unknown }).name === "NotFound"))
  );
}
