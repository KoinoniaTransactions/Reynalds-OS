import { getPortalLaunchChecklistItemById } from "./portal-launch-checklist";

export const portalLaunchProofObjectType = "PortalLaunchProof";

export type PortalLaunchProofStatus = "Completed" | "Needs Follow-up";

export type PortalLaunchProofInput = {
  checklistItemId: string;
  evidenceUrl?: string;
  notes: string;
  proofDate: string;
  proofOwner: string;
  status: PortalLaunchProofStatus;
};

export type PortalLaunchProofRecord = PortalLaunchProofInput & {
  id: string;
  recordedAt: string;
  recordedByEmail?: string;
  recordedByName?: string;
};

export class PortalLaunchProofValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalLaunchProofValidationError";
  }
}

const allowedStatuses = new Set<PortalLaunchProofStatus>(["Completed", "Needs Follow-up"]);

export function validatePortalLaunchProofInput(input: unknown): PortalLaunchProofInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new PortalLaunchProofValidationError("Launch proof request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const checklistItemId = requiredString(value.checklistItemId, "checklistItemId");
  const checklistItem = getPortalLaunchChecklistItemById(checklistItemId);

  if (!checklistItem) {
    throw new PortalLaunchProofValidationError("checklistItemId must match a launch checklist item.");
  }

  if (checklistItem.readinessItemIds && checklistItem.readinessItemIds.length > 0) {
    throw new PortalLaunchProofValidationError(
      "This launch check is automated by readiness signals and cannot be manually marked complete."
    );
  }

  const status = normalizeLaunchProofStatus(value.status);
  const proofOwner = requiredString(value.proofOwner, "proofOwner");
  const proofDate = validateProofDate(requiredString(value.proofDate, "proofDate"));
  const notes = requiredString(value.notes, "notes");
  const evidenceUrl = optionalString(value.evidenceUrl);

  if (notes.length < 20) {
    throw new PortalLaunchProofValidationError("notes must describe the proof in at least 20 characters.");
  }

  if (notes.length > 1200) {
    throw new PortalLaunchProofValidationError("notes must be 1200 characters or less.");
  }

  if (containsUnsafeLaunchProofLanguage(notes)) {
    throw new PortalLaunchProofValidationError(
      "Do not include passwords, access codes, card numbers, bank details, API keys, or private login details in launch proof notes."
    );
  }

  if (evidenceUrl && !isSafeEvidenceUrl(evidenceUrl)) {
    throw new PortalLaunchProofValidationError("evidenceUrl must be a public HTTPS URL.");
  }

  return {
    checklistItemId,
    evidenceUrl,
    notes,
    proofDate,
    proofOwner,
    status
  };
}

export function getPortalLaunchProofRecord(value: {
  createdAt: Date;
  data: unknown;
  id: string;
}): PortalLaunchProofRecord | null {
  if (!value.data || typeof value.data !== "object" || Array.isArray(value.data)) {
    return null;
  }

  const data = value.data as Record<string, unknown>;
  const checklistItemId = optionalString(data.checklistItemId);
  const notes = optionalString(data.notes);
  const proofDate = optionalString(data.proofDate);
  const proofOwner = optionalString(data.proofOwner);
  const status = optionalString(data.status);

  if (
    !checklistItemId ||
    !notes ||
    !proofDate ||
    !proofOwner ||
    !allowedStatuses.has(status as PortalLaunchProofStatus)
  ) {
    return null;
  }

  return {
    checklistItemId,
    evidenceUrl: optionalString(data.evidenceUrl),
    id: value.id,
    notes,
    proofDate,
    proofOwner,
    recordedAt: value.createdAt.toISOString(),
    recordedByEmail: optionalString(data.recordedByEmail),
    recordedByName: optionalString(data.recordedByName),
    status: status as PortalLaunchProofStatus
  };
}

export function buildPortalLaunchProofName(input: PortalLaunchProofInput): string {
  const checklistItem = getPortalLaunchChecklistItemById(input.checklistItemId);

  return `Launch Proof - ${checklistItem?.title ?? input.checklistItemId}`;
}

export function getPortalLaunchProofHealth(status: PortalLaunchProofStatus): string {
  return status === "Completed" ? "Healthy" : "Attention";
}

export function buildPortalLaunchProofNextAction(input: PortalLaunchProofInput): string {
  return input.status === "Completed"
    ? "Review recorded launch proof during final launch approval."
    : "Resolve follow-up before this launch proof can count as complete.";
}

function normalizeLaunchProofStatus(value: unknown): PortalLaunchProofStatus {
  const status = optionalString(value) ?? "Completed";

  if (!allowedStatuses.has(status as PortalLaunchProofStatus)) {
    throw new PortalLaunchProofValidationError("status must be Completed or Needs Follow-up.");
  }

  return status as PortalLaunchProofStatus;
}

function validateProofDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new PortalLaunchProofValidationError("proofDate must use YYYY-MM-DD format.");
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new PortalLaunchProofValidationError("proofDate must be a real date.");
  }

  return value;
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new PortalLaunchProofValidationError(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function containsUnsafeLaunchProofLanguage(value: string): boolean {
  return /\b(password|passcode|access code|recovery code|security code|card number|credit card|debit card|cvv|cvc|routing number|account number|bank login|payment password|api key|secret key|private key|mls password|brokerage password|username:|user name:)\b/i.test(
    value
  );
}

function isSafeEvidenceUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname !== "localhost" &&
      url.hostname !== "127.0.0.1" &&
      url.hostname !== "::1"
    );
  } catch {
    return false;
  }
}
