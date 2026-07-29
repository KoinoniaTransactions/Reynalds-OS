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

export type PortalDocumentFileInput = {
  name: string;
  size: number;
  type?: string;
};

export type PortalDocumentSubmissionInput = {
  documentType: string;
  file: PortalDocumentFileInput;
  notes?: string;
  relatedObjectId?: string;
  requestedAction: string;
  transactionName?: string;
};

export type PortalDocumentSubmission = PortalDocumentSubmissionInput & {
  file: PortalDocumentFileInput & {
    cleanName: string;
    extension: string;
    mimeType: string;
  };
};

export class PortalDocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalDocumentValidationError";
  }
}

export function validatePortalDocumentSubmission(input: unknown): PortalDocumentSubmission {
  if (!input || typeof input !== "object") {
    throw new PortalDocumentValidationError("Document submission must be an object.");
  }

  const value = input as Record<string, unknown>;
  const file = validatePortalDocumentFile(value.file);
  const notes = optionalString(value.notes);

  if (notes && containsCredentialLanguage(notes)) {
    throw new PortalDocumentValidationError(
      "Do not include passwords, access codes, or private login details in document notes."
    );
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

export function getHumanDocumentStatus(status: string): string {
  switch (status) {
    case "Uploaded":
      return "Uploaded";
    case "In Review":
      return "In Review";
    case "Ready for Client Review":
      return "Ready for Review";
    case "Approved":
      return "Approved";
    case "Sent":
      return "Sent";
    case "Archived":
      return "Archived";
    default:
      return status;
  }
}

export function formatDocumentFileSize(fileSizeBytes: number | null | undefined): string {
  if (!fileSizeBytes || fileSizeBytes <= 0) {
    return "Size pending";
  }

  if (fileSizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB`;
  }

  return `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDocumentSubmittedLabel(createdAt: Date | string | null | undefined): string {
  if (!createdAt) {
    return "Submitted";
  }

  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  if (Number.isNaN(date.getTime())) {
    return "Submitted";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

export function sanitizeDocumentFileName(fileName: string): string {
  const name = fileName
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 120);

  return name || "document";
}

export function validatePortalDocumentStorageKey(storageKey: unknown): string {
  const key = optionalString(storageKey);

  if (!key) {
    throw new PortalDocumentValidationError("Document file reference is missing.");
  }

  const normalizedKey = key.replace(/\\/g, "/");
  const segments = normalizedKey.split("/");

  if (
    normalizedKey.startsWith("/") ||
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new PortalDocumentValidationError("Document file reference is invalid.");
  }

  return normalizedKey;
}

export function buildPortalDocumentContentDisposition(fileName: string): string {
  return `attachment; filename="${sanitizeDocumentFileName(fileName)}"`;
}

function validatePortalDocumentFile(file: unknown): PortalDocumentSubmission["file"] {
  if (!file || typeof file !== "object") {
    throw new PortalDocumentValidationError("A document file is required.");
  }

  const value = file as Record<string, unknown>;
  const cleanName = sanitizeDocumentFileName(requiredString(value.name, "fileName"));
  const extension = getFileExtension(cleanName);
  const providedMimeType = optionalString(value.type);
  const mimeType =
    providedMimeType && allowedMimeTypes.has(providedMimeType)
      ? providedMimeType
      : getMimeTypeFromExtension(extension);
  const size = typeof value.size === "number" ? value.size : Number(value.size);

  if (!Number.isFinite(size) || size <= 0) {
    throw new PortalDocumentValidationError("Uploaded document must not be empty.");
  }

  if (size > portalDocumentMaxUploadBytes) {
    throw new PortalDocumentValidationError("Uploaded document must be 25 MB or smaller.");
  }

  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(mimeType)) {
    throw new PortalDocumentValidationError(
      "Upload a PDF, Word document, Excel document, JPG, or PNG file."
    );
  }

  return {
    name: requiredString(value.name, "fileName"),
    size,
    type: optionalString(value.type),
    cleanName,
    extension,
    mimeType
  };
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || extension === fileName.toLowerCase()) {
    throw new PortalDocumentValidationError("Uploaded document must include a file extension.");
  }

  return extension;
}

function getMimeTypeFromExtension(extension: string): string {
  switch (extension) {
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new PortalDocumentValidationError(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function containsCredentialLanguage(value: string): boolean {
  return /\b(password|passcode|credential|secret|token|api key|lockbox|gate code|door code|alarm code|combo|pin|mls login|showingtime login|forms login|e-signature login)\b/i.test(
    value
  );
}
