import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import {
  PortalDocumentValidationError,
  validatePortalDocumentScannerCommand,
  validatePortalDocumentUploadRoot
} from "./portal-documents";

const execFileAsync = promisify(execFile);

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
  try { return resolve(validatePortalDocumentUploadRoot(process.env.PORTAL_DOCUMENT_UPLOAD_DIR)); } catch { return null; }
}

export function getConfiguredPortalDocumentScannerCommand(): string | null {
  try { return validatePortalDocumentScannerCommand(process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND); } catch { return null; }
}

export function getPortalDocumentFormFile(formData: FormData, fieldName: string): File {
  const file = formData.get(fieldName);
  if (!(file instanceof File)) throw new PortalDocumentValidationError("A document file is required.");
  return file;
}

export async function scanPortalDocumentUpload({ cleanName, file, scannerCommand, uploadRoot, workspaceId }: {
  cleanName: string; file: File; scannerCommand: string; uploadRoot: string; workspaceId: string;
}) {
  const workspaceSegment = getSafeStorageSegment(workspaceId);
  const scanFileName = `${randomUUID()}-${cleanName}`;
  const scanPath = join(uploadRoot, workspaceSegment, ".scan", scanFileName);
  await mkdir(dirname(scanPath), { recursive: true });
  try {
    await writeFile(scanPath, Buffer.from(await file.arrayBuffer()), { mode: 0o600 });
    await scanPortalDocumentFile(scanPath, scannerCommand);
  } finally {
    await removeStoredFileQuietly(scanPath);
  }
}

async function scanPortalDocumentFile(filePath: string, scannerCommand: string) {
  try {
    await execFileAsync(scannerCommand, [filePath], { timeout: 30_000 });
  } catch (error) {
    if (isScannerUnavailableError(error)) throw new PortalDocumentScanUnavailableError("Document malware scanning is temporarily unavailable.");
    throw new PortalDocumentScanFailedError("Uploaded document did not pass malware scanning.");
  }
}

async function removeStoredFileQuietly(filePath: string) {
  try { await unlink(filePath); } catch { }
}

function getSafeStorageSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "_").slice(0, 80) || "workspace";
}

function isScannerUnavailableError(error: unknown): boolean {
  return error instanceof Error && "code" in error && (((error as { code?: unknown }).code === "ENOENT") || ((error as { code?: unknown }).code === "EACCES") || ((error as { signal?: unknown }).signal === "SIGTERM"));
}
