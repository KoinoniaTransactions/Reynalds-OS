import { isAbsolute } from "node:path";

export const portalDocumentMaxUploadBytes = 25 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png"
]);
const allowedExtensions = new Set(["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"]);

export type PortalDocumentSubmission = {
  documentType: string;
  file: {
    name: string;
    size: number;
    type?: string;
    cleanName: string;
    extension: string;
    mimeType: string;
  };
  notes?: string;
  relatedObjectId?: string;
  requestedAction: string;
  transactionName?: string;
};

export class PortalDocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalDocumentValidationError";
  }
}

export function validatePortalDocumentSubmission(input: unknown): PortalDocumentSubmission {
  if (!input || typeof input !== "object") throw new PortalDocumentValidationError("Document submission must be an object.");
  const value = input as Record<string, unknown>;
  const file = validatePortalDocumentFile(value.file);
  const notes = optionalString(value.notes);
  if (notes && containsCredentialLanguage(notes)) {
    throw new PortalDocumentValidationError("Do not include passwords, card numbers, access codes, or private login details in document notes.");
  }
  return {
    documentType: requiredString(value.documentType, "documentType"),
    file,
    notes,
    relatedObjectId: optionalString(value.relatedObjectId),
    requestedAction: optionalString(value.requestedAction) ?? "Review uploaded document",
    transactionName: optionalString(value.transactionName)
  };
}

export function buildPortalDocumentDisplayName(input: PortalDocumentSubmission): string {
  const transactionName = input.transactionName ? `${input.transactionName} - ` : "";
  return `${transactionName}${input.documentType}`;
}

export function sanitizeDocumentFileName(fileName: string): string {
  const name = fileName.normalize("NFKD").replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^\.+/, "").replace(/^[.-]+|[.-]+$/g, "").slice(0, 120);
  return name || "document";
}

export function validatePortalDocumentUploadRoot(uploadRoot: unknown): string {
  const root = optionalString(uploadRoot);
  if (!root) throw new PortalDocumentValidationError("Document upload storage is not configured.");
  if (!isAbsolute(root)) throw new PortalDocumentValidationError("Document upload storage must use an absolute path.");
  return root;
}

export function validatePortalDocumentScannerCommand(command: unknown): string {
  const scannerCommand = optionalString(command);
  if (!scannerCommand) throw new PortalDocumentValidationError("Document malware scanner is not configured.");
  if (!isAbsolute(scannerCommand)) throw new PortalDocumentValidationError("Document malware scanner command must be an absolute path.");
  return scannerCommand;
}

function validatePortalDocumentFile(file: unknown): PortalDocumentSubmission["file"] {
  if (!file || typeof file !== "object") throw new PortalDocumentValidationError("A document file is required.");
  const value = file as Record<string, unknown>;
  const originalName = requiredString(value.name, "fileName");
  const cleanName = sanitizeDocumentFileName(originalName);
  const extension = getFileExtension(cleanName);
  const providedMimeType = optionalString(value.type);
  const mimeType = providedMimeType && allowedMimeTypes.has(providedMimeType) ? providedMimeType : getMimeTypeFromExtension(extension);
  const size = typeof value.size === "number" ? value.size : Number(value.size);
  if (!Number.isFinite(size) || size <= 0) throw new PortalDocumentValidationError("Uploaded document must not be empty.");
  if (size > portalDocumentMaxUploadBytes) throw new PortalDocumentValidationError("Uploaded document must be 25 MB or smaller.");
  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(mimeType)) throw new PortalDocumentValidationError("Upload a PDF, Word document, Excel document, JPG, or PNG file.");
  return { name: originalName, size, type: providedMimeType, cleanName, extension, mimeType };
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || extension === fileName.toLowerCase()) throw new PortalDocumentValidationError("Uploaded document must include a file extension.");
  return extension;
}

function getMimeTypeFromExtension(extension: string): string {
  switch (extension) {
    case "pdf": return "application/pdf";
    case "doc": return "application/msword";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls": return "application/vnd.ms-excel";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    default: return "application/octet-stream";
  }
}

function requiredString(value: unknown, field: string): string {
  const normalized = optionalString(value);
  if (!normalized) throw new PortalDocumentValidationError(`${field} is required.`);
  return normalized;
}
function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}
function containsCredentialLanguage(value: string): boolean {
  return /\b(password|passcode|access code|security code|cvv|credit card|debit card|login|pin)\b/i.test(value);
}
