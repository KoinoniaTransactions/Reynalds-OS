export const clientPortalWorkObjectTypes = [
  "Transaction",
  "Task",
  "Service",
  "Customer Success",
  "ShowingRequest",
  "AccessRequest",
  "BillingSetupRequest"
] as const;

const clientPortalWorkObjectTypeSet = new Set<string>(clientPortalWorkObjectTypes);

export type PortalWorkStatusBucket = "active" | "completed" | "review" | "waiting";

export type PortalWorkAssignmentInput = {
  assignedStaffUserId: string | null;
  assignmentNote?: string;
  backupStaffUserId: string | null;
};

export class PortalWorkAssignmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalWorkAssignmentValidationError";
  }
}

export function isClientPortalWorkObjectType(objectType: string): boolean {
  return clientPortalWorkObjectTypeSet.has(objectType);
}

export function getPortalWorkItemTypeLabel(objectType: string): string {
  switch (objectType) {
    case "AccessRequest":
      return "Access Request";
    case "BillingSetupRequest":
      return "Billing Setup";
    case "Customer Success":
      return "Client Follow-Up";
    case "ShowingRequest":
      return "Showing Request";
    case "Service":
      return "Service Support";
    case "Task":
      return "Task";
    case "Transaction":
      return "Transaction Support";
    default:
      return objectType;
  }
}

export function getPortalWorkStatusBucket(status: string): PortalWorkStatusBucket {
  const normalizedStatus = status.toLowerCase();

  if (
    /\b(completed?|archived|closed|sent|approved)\b/.test(normalizedStatus)
  ) {
    return "completed";
  }

  if (
    /\b(review|approval|ready)\b/.test(normalizedStatus)
  ) {
    return "review";
  }

  if (
    /\b(waiting|needed|blocked|missing|requested)\b/.test(normalizedStatus)
  ) {
    return "waiting";
  }

  return "active";
}

export function getPortalWorkDueLabel(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Date pending";
  }

  const value = data as Record<string, unknown>;

  for (const key of ["dueLabel", "due", "dueAt", "closeDate", "preferredWindow", "triggerDescription"]) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "Date pending";
}

export function buildPortalWorkSummaryCounts(items: Array<{ status: string }>) {
  const counts = {
    active: 0,
    completed: 0,
    review: 0,
    waiting: 0
  };

  for (const item of items) {
    counts[getPortalWorkStatusBucket(item.status)] += 1;
  }

  return counts;
}

export function validatePortalWorkAssignmentInput(input: unknown): PortalWorkAssignmentInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new PortalWorkAssignmentValidationError("Assignment request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const assignedStaffUserId = optionalUserId(value.assignedStaffUserId, "assignedStaffUserId");
  const backupStaffUserId = optionalUserId(value.backupStaffUserId, "backupStaffUserId");
  const assignmentNote = optionalText(value.assignmentNote);

  if (assignedStaffUserId && backupStaffUserId && assignedStaffUserId === backupStaffUserId) {
    throw new PortalWorkAssignmentValidationError(
      "Primary and backup staff must be different people."
    );
  }

  if (!assignedStaffUserId && !assignmentNote) {
    throw new PortalWorkAssignmentValidationError(
      "Add a primary staff owner, or include a note explaining why the work remains unassigned."
    );
  }

  if (assignmentNote && assignmentNote.length > 500) {
    throw new PortalWorkAssignmentValidationError("assignmentNote must be 500 characters or less.");
  }

  if (assignmentNote && containsUnsafeAssignmentLanguage(assignmentNote)) {
    throw new PortalWorkAssignmentValidationError(
      "Do not include passwords, access codes, card numbers, bank details, API keys, or private login details in assignment notes."
    );
  }

  return {
    assignedStaffUserId,
    assignmentNote,
    backupStaffUserId
  };
}

function optionalUserId(value: unknown, fieldName: string): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new PortalWorkAssignmentValidationError(`${fieldName} must be a staff user id or blank.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^[A-Za-z0-9_-]{3,128}$/.test(trimmed)) {
    throw new PortalWorkAssignmentValidationError(`${fieldName} must be a valid staff user id.`);
  }

  return trimmed;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function containsUnsafeAssignmentLanguage(value: string): boolean {
  return /\b(password|passcode|access code|recovery code|security code|card number|credit card|debit card|cvv|cvc|routing number|account number|bank login|payment password|api key|secret key|private key|mls password|brokerage password|username:|user name:)\b/i.test(
    value
  );
}
