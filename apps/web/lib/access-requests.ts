export const accessRequestObjectType = "AccessRequest";

export type AccessRequestStatus =
  | "Access Needed"
  | "Waiting on Client"
  | "Client Says Granted"
  | "Blocked"
  | "No Longer Needed";

export type AccessRequestInput = {
  accessPurpose: string;
  clientName?: string;
  notes?: string;
  permissionLevel: string;
  platformName: string;
  relatedWorkName?: string;
  status: AccessRequestStatus;
};

export class AccessRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessRequestValidationError";
  }
}

const allowedStatuses = new Set<AccessRequestStatus>([
  "Access Needed",
  "Waiting on Client",
  "Client Says Granted",
  "Blocked",
  "No Longer Needed"
]);

export function validateAccessRequestInput(input: unknown): AccessRequestInput {
  if (!input || typeof input !== "object") {
    throw new AccessRequestValidationError("Access request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const notes = optionalString(value.notes);

  if (notes && containsCredentialLanguage(notes)) {
    throw new AccessRequestValidationError(
      "Do not include passwords, usernames, access codes, recovery codes, or private login details in access request notes."
    );
  }

  return {
    accessPurpose: requiredString(value.accessPurpose, "accessPurpose"),
    clientName: optionalString(value.clientName),
    notes,
    permissionLevel: optionalString(value.permissionLevel) ?? "Delegated or team access",
    platformName: requiredString(value.platformName, "platformName"),
    relatedWorkName: optionalString(value.relatedWorkName),
    status: normalizeAccessRequestStatus(value.status)
  };
}

export function buildAccessRequestName(input: AccessRequestInput): string {
  return `Access Request - ${input.platformName}`;
}

export function buildAccessRequestNextAction(input: AccessRequestInput): string {
  switch (input.status) {
    case "Client Says Granted":
      return "Verify delegated access works and update the work item before using it.";
    case "No Longer Needed":
      return "Confirm this access request can be closed.";
    case "Blocked":
      return "Review what is blocking safe delegated access before work continues.";
    case "Waiting on Client":
      return "Wait for the client to grant delegated access or confirm approved next steps.";
    case "Access Needed":
    default:
      return "Send the client safe access instructions and avoid collecting raw credentials.";
  }
}

export function getAccessRequestHealth(status: AccessRequestStatus): string {
  switch (status) {
    case "Client Says Granted":
    case "No Longer Needed":
      return "Healthy";
    case "Blocked":
      return "Critical";
    case "Access Needed":
    case "Waiting on Client":
    default:
      return "Attention";
  }
}

export function getHumanAccessRequestStatus(status: string): string {
  switch (status) {
    case "Client Says Granted":
      return "Client Says Granted";
    case "No Longer Needed":
      return "No Longer Needed";
    case "Waiting on Client":
      return "Waiting on Client";
    case "Access Needed":
      return "Access Needed";
    case "Blocked":
      return "Blocked";
    default:
      return status;
  }
}

export function getAccessRequestDetail(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Access details needed.";
  }

  const value = data as Record<string, unknown>;
  const purpose = optionalString(value.accessPurpose) ?? "Access details needed";
  const level = optionalString(value.permissionLevel) ?? "Delegated access";

  return `${purpose} - ${level}`;
}

export function getAccessRequestMetaLabels(data: unknown): string[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["No secret stored"];
  }

  const value = data as Record<string, unknown>;
  const labels = ["No password stored"];
  const relatedWorkName = optionalString(value.relatedWorkName);
  const clientName = optionalString(value.clientName);

  if (relatedWorkName) {
    labels.push(relatedWorkName);
  }

  if (clientName) {
    labels.push(clientName);
  }

  return labels;
}

function normalizeAccessRequestStatus(value: unknown): AccessRequestStatus {
  const status = optionalString(value) ?? "Access Needed";

  if (!allowedStatuses.has(status as AccessRequestStatus)) {
    throw new AccessRequestValidationError("status must match an approved access request status.");
  }

  return status as AccessRequestStatus;
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new AccessRequestValidationError(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function containsCredentialLanguage(value: string): boolean {
  return /\b(password|passcode|credential|secret|token|api key|recovery code|backup code|lockbox|gate code|door code|alarm code|combo|pin)\b|\b(user(name)?|login)\s*(is|:)\b/i.test(
    value
  );
}
