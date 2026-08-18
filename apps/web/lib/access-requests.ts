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
  grantMethod: string;
  noSecretsAcknowledged: boolean;
  notes?: string;
  permissionLevel: string;
  platformName: string;
  relatedWorkName?: string;
  status: AccessRequestStatus;
};

export type AccessRequestStatusUpdateInput = {
  notes?: string;
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
  const noSecretsAcknowledged = value.noSecretsAcknowledged === true;

  if (notes && containsCredentialLanguage(notes)) {
    throw new AccessRequestValidationError(
      "Do not include passwords, usernames, access codes, recovery codes, or private login details in access request notes."
    );
  }

  if (!noSecretsAcknowledged) {
    throw new AccessRequestValidationError(
      "Confirm that this access request will not include passwords, access codes, API keys, or private login details."
    );
  }

  return {
    accessPurpose: requiredString(value.accessPurpose, "accessPurpose"),
    clientName: optionalString(value.clientName),
    grantMethod: normalizeGrantMethod(value.grantMethod),
    noSecretsAcknowledged,
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
  if (input.status === "Access Needed") {
    return `Send the client safe access instructions for ${input.grantMethod} and avoid collecting raw credentials.`;
  }

  return buildAccessRequestStatusNextAction(input.status);
}

export function buildAccessRequestStatusNextAction(status: AccessRequestStatus): string {
  switch (status) {
    case "Client Says Granted":
      return "Verify delegated access works and update the work item before using it.";
    case "No Longer Needed":
      return "Confirm this access request can be closed.";
    case "Blocked":
      return "Review what is blocking safe delegated access before work continues.";
    case "Waiting on Client":
      return "Wait for the client to grant delegated access or confirm approved next steps.";
    case "Access Needed":
      return "Send the client safe access instructions and avoid collecting raw credentials.";
  }
}

export function validateAccessRequestStatusUpdateInput(
  input: unknown
): AccessRequestStatusUpdateInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AccessRequestValidationError("Access request status update body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const notes = optionalString(value.notes);

  if (notes && containsCredentialLanguage(notes)) {
    throw new AccessRequestValidationError(
      "Do not include passwords, usernames, access codes, recovery codes, or private login details in access request status notes."
    );
  }

  return {
    notes,
    status: normalizeRequiredAccessRequestStatus(value.status)
  };
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
  const grantMethod = optionalString(value.grantMethod);

  return grantMethod ? `${purpose} - ${level} via ${grantMethod}` : `${purpose} - ${level}`;
}

export function getAccessRequestMetaLabels(data: unknown): string[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["No secret stored"];
  }

  const value = data as Record<string, unknown>;
  const labels = ["No password stored"];
  const relatedWorkName = optionalString(value.relatedWorkName);
  const clientName = optionalString(value.clientName);
  const grantMethod = optionalString(value.grantMethod);

  if (grantMethod) {
    labels.push(grantMethod);
  }

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

function normalizeRequiredAccessRequestStatus(value: unknown): AccessRequestStatus {
  const status = optionalString(value);

  if (!status) {
    throw new AccessRequestValidationError("status is required.");
  }

  if (!allowedStatuses.has(status as AccessRequestStatus)) {
    throw new AccessRequestValidationError("status must match an approved access request status.");
  }

  return status as AccessRequestStatus;
}

function normalizeGrantMethod(value: unknown): string {
  const grantMethod = optionalString(value) ?? "Delegated user access";
  const allowedGrantMethods = new Set([
    "Delegated user access",
    "Team or assistant seat",
    "Read-only role",
    "Processor or platform invite",
    "Broker-approved secure sharing link",
    "Client will complete directly"
  ]);

  if (!allowedGrantMethods.has(grantMethod)) {
    throw new AccessRequestValidationError("grantMethod must match an approved safe access method.");
  }

  return grantMethod;
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
