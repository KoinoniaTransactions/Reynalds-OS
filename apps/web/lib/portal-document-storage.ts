import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import type { AuthUser } from "@reynalds-os/auth";
import {
  PortalDocumentValidationError,
  validatePortalDocumentScannerCommand,
  validatePortalDocumentUploadRoot
} from "./portal-documents";

const execFileAsync = promisify(execFile);

export type StoredPortalDocument = {
  fileUrl: string;
  localPath: string;
  storageKey: string;
};

export class PortalDocumentScanFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalDocumentScanFailedError";
  }
}

export class PortalDocumentScanUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalDocumentScanUnavailableError";
  }
}

export function getConfiguredPortalDocumentUploadRoot(): string | null {
  try {
    return resolve(validatePortalDocumentUploadRoot(process.env.PORTAL_DOCUMENT_UPLOAD_DIR));
  } catch {
    return null;
  }
}

export function getConfiguredPortalDocumentScannerCommand(): string | null {
  try {
    return validatePortalDocumentScannerCommand(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND);
  } catch {
    return null;
  }
}

export function getPortalDocumentFormFile(formData: FormData, fieldName: string): File {
  const file = formData.get(fieldName);

  if (!(file instanceof File)) {
    throw new PortalDocumentValidationError("A document file is required.");
  }

  return file;
}

export async function persistPortalDocumentFile({
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

export async function removeStoredFileQuietly(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // Best-effort cleanup only; the request still returns the real failure.
  }
}

export async function scanPortalDocumentFile(filePath: string, scannerCommand: string) {
  try {
    await execFileAsync(scannerCommand, [filePath], { timeout: 30_000 });
  } catch (error) {
    if (isScannerUnavailableError(error)) {
      throw new PortalDocumentScanUnavailableError(
        "Document malware scanning is temporarily unavailable."
      );
    }

    throw new PortalDocumentScanFailedError("Uploaded document did not pass malware scanning.");
  }
}

function getSafeStorageSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 80) || "workspace";
}

function isScannerUnavailableError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    ((error as { code?: unknown }).code === "ENOENT" ||
      (error as { code?: unknown }).code === "EACCES" ||
      (error as { signal?: unknown }).signal === "SIGTERM")
  );
}
