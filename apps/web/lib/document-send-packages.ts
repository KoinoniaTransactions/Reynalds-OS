export const documentSendPackageObjectType = "DocumentSendPackage";

export const documentSendPackageStatuses = [
  "Approval Needed",
  "Ready to Send",
  "Sent",
  "Signature Monitoring",
  "Completed",
  "Blocked"
] as const;

export const documentSendPackageDeliveryChannels = [
  "Client Portal",
  "Email Package",
  "E-Signature Provider",
  "Brokerage Platform",
  "Manual Delivery"
] as const;

export type DocumentSendPackageStatus = (typeof documentSendPackageStatuses)[number];
export type DocumentSendPackageDeliveryChannel =
  (typeof documentSendPackageDeliveryChannels)[number];

export type DocumentSendPackageInput = {
  approvalConfirmed: boolean;
  deliveryChannel: DocumentSendPackageDeliveryChannel;
  documentIds: string[];
  notes?: string;
  packageName: string;
  recipientSummary: string;
  requestedSendTiming?: string;
  signatureRequired: boolean;
  status: DocumentSendPackageStatus;
};

export type DocumentSendPackageStatusUpdateInput = {
  deliveryConfirmation?: string;
  notes?: string;
  status: DocumentSendPackageStatus;
};

export class DocumentSendPackageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentSendPackageValidationError";
  }
}

export function validateDocumentSendPackageInput(input: unknown): DocumentSendPackageInput {
  if (!input || typeof input !== "object") {
    throw new DocumentSendPackageValidationError("Document send package body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const approvalConfirmed = value.approvalConfirmed === true;
  const signatureRequired = value.signatureRequired === true;
  const notes = boundedOptionalString(value.notes, "notes", 1_500);
  const recipientSummary = boundedRequiredString(
    value.recipientSummary,
    "recipientSummary",
    500
  );

  if (
    (notes && containsSensitiveDeliveryLanguage(notes)) ||
    containsSensitiveDeliveryLanguage(recipientSummary)
  ) {
    throw new DocumentSendPackageValidationError(
      "Do not include passwords, card numbers, access codes, or private login details in send package notes."
    );
  }

  return {
    approvalConfirmed,
    deliveryChannel: normalizeDeliveryChannel(value.deliveryChannel),
    documentIds: normalizeDocumentIds(value.documentIds),
    notes,
    packageName: boundedRequiredString(value.packageName, "packageName", 160),
    recipientSummary,
    requestedSendTiming: boundedOptionalString(
      value.requestedSendTiming,
      "requestedSendTiming",
      160
    ),
    signatureRequired,
    status: normalizeSendPackageStatus(value.status, approvalConfirmed)
  };
}

export function validateDocumentSendPackageStatusUpdateInput(
  input: unknown
): DocumentSendPackageStatusUpdateInput {
  if (!input || typeof input !== "object") {
    throw new DocumentSendPackageValidationError("Document send package update body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const deliveryConfirmation = boundedOptionalString(
    value.deliveryConfirmation,
    "deliveryConfirmation",
    500
  );
  const notes = boundedOptionalString(value.notes, "notes", 1_000);

  if (
    (deliveryConfirmation && containsSensitiveDeliveryLanguage(deliveryConfirmation)) ||
    (notes && containsSensitiveDeliveryLanguage(notes))
  ) {
    throw new DocumentSendPackageValidationError(
      "Do not include passwords, card numbers, access codes, or private login details in send package updates."
    );
  }

  return {
    deliveryConfirmation,
    notes,
    status: normalizeRequiredSendPackageStatus(value.status)
  };
}

export function buildDocumentSendPackageName(input: DocumentSendPackageInput): string {
  return `Send Package - ${input.packageName}`;
}

export function buildDocumentSendPackageNextAction(input: DocumentSendPackageInput): string {
  return buildDocumentSendPackageStatusNextAction(input.status, input.signatureRequired);
}

export function buildDocumentSendPackageStatusNextAction(
  status: DocumentSendPackageStatus,
  signatureRequired = false
): string {
  switch (status) {
    case "Ready to Send":
      return signatureRequired
        ? "Route through the approved e-signature workflow after final staff check."
        : "Send the approved document package through the selected delivery channel.";
    case "Sent":
      return "Record delivery confirmation and monitor for client response.";
    case "Signature Monitoring":
      return "Monitor signature completion and follow up before deadlines are missed.";
    case "Completed":
      return "Confirm the sent package is ready for archive delivery.";
    case "Blocked":
      return "Resolve the send-package blocker before delivery continues.";
    case "Approval Needed":
    default:
      return "Record Realtor approval before any document package is sent.";
  }
}

export function getDocumentSendPackageHealth(status: DocumentSendPackageStatus): string {
  switch (status) {
    case "Completed":
      return "Healthy";
    case "Ready to Send":
    case "Sent":
    case "Signature Monitoring":
      return "Attention";
    case "Blocked":
      return "Critical";
    case "Approval Needed":
    default:
      return "Attention";
  }
}

export function getHumanDocumentSendPackageStatus(status: string): string {
  return documentSendPackageStatuses.includes(status as DocumentSendPackageStatus)
    ? status
    : status;
}

export function getDocumentSendPackageDetail(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Send package details needed.";
  }

  const value = data as Record<string, unknown>;
  const deliveryChannel = optionalString(value.deliveryChannel) ?? "Delivery channel needed";
  const recipientSummary = optionalString(value.recipientSummary) ?? "Recipients needed";

  return `${deliveryChannel} - ${recipientSummary}`;
}

export function getDocumentSendPackageMetaLabels(data: unknown): string[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Approval gate required"];
  }

  const value = data as Record<string, unknown>;
  const labels = [
    value.approvalConfirmed === true ? "Approval recorded" : "Approval needed",
    value.signatureRequired === true ? "Signature required" : "No signature required"
  ];
  const requestedSendTiming = optionalString(value.requestedSendTiming);
  const documentCount = getJsonArrayCount(value.documentIds);

  if (documentCount > 0) {
    labels.push(`${documentCount} document${documentCount === 1 ? "" : "s"}`);
  }

  if (requestedSendTiming) {
    labels.push(requestedSendTiming);
  }

  return labels;
}

export function isDocumentSendPackageApprovalConfirmed(data: unknown): boolean {
  return Boolean(
    data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      (data as Record<string, unknown>).approvalConfirmed === true
  );
}

export function documentSendPackageStatusRequiresApproval(
  status: DocumentSendPackageStatus
): boolean {
  return ["Ready to Send", "Sent", "Signature Monitoring", "Completed"].includes(status);
}

function normalizeSendPackageStatus(
  value: unknown,
  approvalConfirmed: boolean
): DocumentSendPackageStatus {
  const status = optionalString(value) ?? (approvalConfirmed ? "Ready to Send" : "Approval Needed");

  if (!documentSendPackageStatuses.includes(status as DocumentSendPackageStatus)) {
    throw new DocumentSendPackageValidationError(
      "status must match an approved document send package status."
    );
  }

  if (!approvalConfirmed && status !== "Blocked") {
    return "Approval Needed";
  }

  if (
    !approvalConfirmed &&
    ["Ready to Send", "Sent", "Signature Monitoring", "Completed"].includes(status)
  ) {
    throw new DocumentSendPackageValidationError(
      "Realtor approval must be confirmed before a package can be marked ready, sent, or complete."
    );
  }

  return status as DocumentSendPackageStatus;
}

function normalizeRequiredSendPackageStatus(value: unknown): DocumentSendPackageStatus {
  const status = optionalString(value);

  if (!status) {
    throw new DocumentSendPackageValidationError("status is required.");
  }

  if (!documentSendPackageStatuses.includes(status as DocumentSendPackageStatus)) {
    throw new DocumentSendPackageValidationError(
      "status must match an approved document send package status."
    );
  }

  return status as DocumentSendPackageStatus;
}

function normalizeDeliveryChannel(value: unknown): DocumentSendPackageDeliveryChannel {
  const deliveryChannel = optionalString(value) ?? "Client Portal";

  if (
    !documentSendPackageDeliveryChannels.includes(
      deliveryChannel as DocumentSendPackageDeliveryChannel
    )
  ) {
    throw new DocumentSendPackageValidationError(
      "deliveryChannel must match an approved document delivery channel."
    );
  }

  return deliveryChannel as DocumentSendPackageDeliveryChannel;
}

function normalizeDocumentIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new DocumentSendPackageValidationError("At least one document must be selected.");
  }

  const documentIds = Array.from(
    new Set(
      value
        .map((item) => optionalString(item))
        .filter((item): item is string => Boolean(item))
    )
  );

  if (!documentIds.length) {
    throw new DocumentSendPackageValidationError("At least one document must be selected.");
  }

  if (documentIds.length > 20) {
    throw new DocumentSendPackageValidationError(
      "Document send packages can include up to 20 documents."
    );
  }

  if (documentIds.some((documentId) => documentId.length > 120)) {
    throw new DocumentSendPackageValidationError("A selected document reference is invalid.");
  }

  return documentIds;
}

function boundedRequiredString(value: unknown, fieldName: string, maxLength: number): string {
  const text = boundedOptionalString(value, fieldName, maxLength);

  if (!text) {
    throw new DocumentSendPackageValidationError(`${fieldName} is required.`);
  }

  return text;
}

function boundedOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number
): string | undefined {
  const text = optionalString(value);

  if (!text) {
    return undefined;
  }

  if (text.length > maxLength) {
    throw new DocumentSendPackageValidationError(
      `${fieldName} must be ${maxLength} characters or fewer.`
    );
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getJsonArrayCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function containsSensitiveDeliveryLanguage(value: string): boolean {
  return /\b(password|passcode|credential|secret|token|api key|recovery code|backup code|lockbox|gate code|door code|alarm code|combo|pin|cvv|cvc|credit card|debit card|routing number|account number|bank login|payment password|brokerage password|mls password|e-signature password)\b|\b(user(name)?|login)\s*(is|:)\b/i.test(
    value
  );
}
