export const payAtCloseTriggerObjectType = "PayAtClosingTrigger";
export const successfulCloseOutcome = "successful_close";

export type PayAtCloseConfirmationInput = {
  closingDate: Date;
  confirmationSource: string;
  note?: string;
  outcome: typeof successfulCloseOutcome;
};

export type PayAtCloseInvoiceSource = {
  amount: unknown;
  paidAt?: Date | string | null;
  relatedObjectId?: string | null;
  status: string;
};

export type PayAtCloseServiceActivationSource = {
  data: unknown;
  id: string;
  objectType: string;
  status?: string;
};

export type PayAtCloseServiceLink = {
  relatedWorkObjectId: string;
};

export class PayAtCloseTriggerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayAtCloseTriggerValidationError";
  }
}

const blockedManualPayAtCloseStatuses = new Set([
  "Ready to Process",
  "Processing",
  "Paid",
  "Payment Failed",
  "Refunded"
]);

export function validatePayAtCloseConfirmationInput(
  input: unknown,
  now = new Date()
): PayAtCloseConfirmationInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new PayAtCloseTriggerValidationError(
      "Successful-close confirmation must be an object."
    );
  }

  const value = input as Record<string, unknown>;
  const outcome = requiredString(value.outcome, "outcome");

  if (outcome !== successfulCloseOutcome) {
    throw new PayAtCloseTriggerValidationError(
      "Only a confirmed successful closing can release a pay-at-close invoice."
    );
  }

  const closingDateText = requiredString(value.closingDate, "closingDate");
  const closingDate = parseDateOnly(closingDateText);

  if (!closingDate) {
    throw new PayAtCloseTriggerValidationError(
      "closingDate must be a valid YYYY-MM-DD date."
    );
  }

  if (toDateKey(closingDate) > toDateKey(now)) {
    throw new PayAtCloseTriggerValidationError(
      "A successful closing cannot be confirmed with a future closing date."
    );
  }

  const confirmationSource = requiredString(
    value.confirmationSource,
    "confirmationSource"
  );
  const note = optionalString(value.note);

  if (confirmationSource.length > 160) {
    throw new PayAtCloseTriggerValidationError(
      "confirmationSource must be 160 characters or fewer."
    );
  }

  if (note && note.length > 500) {
    throw new PayAtCloseTriggerValidationError(
      "note must be 500 characters or fewer."
    );
  }

  rejectSensitivePaymentData(confirmationSource);
  rejectSensitivePaymentData(note);

  return {
    closingDate,
    confirmationSource,
    note,
    outcome: successfulCloseOutcome
  };
}

export function assertPayAtCloseTriggerEligibility({
  invoice,
  serviceActivation
}: {
  invoice: PayAtCloseInvoiceSource;
  serviceActivation: PayAtCloseServiceActivationSource;
}): PayAtCloseServiceLink {
  if (normalizeInvoiceStatus(invoice.status) !== "Pay at Close Watch") {
    throw new PayAtCloseTriggerValidationError(
      "Only an invoice on Pay at Close Watch can receive a successful-close trigger."
    );
  }

  if (invoice.paidAt) {
    throw new PayAtCloseTriggerValidationError(
      "A paid invoice cannot receive a new pay-at-close trigger."
    );
  }

  const amount = toAmount(invoice.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PayAtCloseTriggerValidationError(
      "The pay-at-close invoice must have a positive amount."
    );
  }

  if (!invoice.relatedObjectId) {
    throw new PayAtCloseTriggerValidationError(
      "The pay-at-close invoice must be linked to its ServiceActivation."
    );
  }

  if (
    serviceActivation.objectType !== "ServiceActivation" ||
    serviceActivation.id !== invoice.relatedObjectId
  ) {
    throw new PayAtCloseTriggerValidationError(
      "The invoice is not linked to the expected ServiceActivation."
    );
  }

  if (serviceActivation.status === "Cancelled") {
    throw new PayAtCloseTriggerValidationError(
      "A cancelled service activation cannot release a pay-at-close invoice."
    );
  }

  const data = toRecord(serviceActivation.data);

  if (data.billingModel !== "pay_at_close") {
    throw new PayAtCloseTriggerValidationError(
      "The linked service does not use the pay-at-close billing model."
    );
  }

  if (data.consentStatus !== "Authorized") {
    throw new PayAtCloseTriggerValidationError(
      "Authorized pay-at-close billing consent is required before confirming the closing trigger."
    );
  }

  const relatedWorkObjectId = optionalString(data.relatedWorkObjectId);

  if (!relatedWorkObjectId) {
    throw new PayAtCloseTriggerValidationError(
      "The pay-at-close ServiceActivation must be linked to a transaction or work object."
    );
  }

  return {
    relatedWorkObjectId
  };
}

export function isManualPayAtCloseTransitionBlocked(
  currentStatus: string,
  nextStatus: string
): boolean {
  return (
    normalizeInvoiceStatus(currentStatus) === "Pay at Close Watch" &&
    blockedManualPayAtCloseStatuses.has(nextStatus)
  );
}

export function assertManualPayAtCloseInvoiceTransitionAllowed(
  currentStatus: string,
  nextStatus: string
) {
  if (isManualPayAtCloseTransitionBlocked(currentStatus, nextStatus)) {
    throw new PayAtCloseTriggerValidationError(
      "Confirm a successful closing through the pay-at-close workflow before moving this invoice into processing or payment states."
    );
  }
}

export function buildPayAtCloseTriggerData({
  actorId,
  confirmedAt,
  input,
  invoiceId,
  relatedWorkObjectId,
  serviceActivationId
}: {
  actorId: string;
  confirmedAt: Date;
  input: PayAtCloseConfirmationInput;
  invoiceId: string;
  relatedWorkObjectId: string;
  serviceActivationId: string;
}): Record<string, string | null> {
  return {
    closingDate: input.closingDate.toISOString().slice(0, 10),
    confirmationSource: input.confirmationSource,
    confirmedAt: confirmedAt.toISOString(),
    confirmedByUserId: actorId,
    invoiceId,
    note: input.note ?? null,
    outcome: input.outcome,
    relatedWorkObjectId,
    serviceActivationId
  };
}

function normalizeInvoiceStatus(status: string): string {
  return status === "Waiting on Successful Closing"
    ? "Pay at Close Watch"
    : status;
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function toDateKey(value: Date): string {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function toAmount(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "toString" in value &&
    typeof value.toString === "function"
  ) {
    return Number(value.toString());
  }

  return Number(value);
}

function toRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new PayAtCloseTriggerValidationError(
      `${fieldName} is required.`
    );
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function rejectSensitivePaymentData(value: string | undefined) {
  if (!value) {
    return;
  }

  if (
    /\b(card number|credit card|debit card|cvv|cvc|security code|routing number|account number|bank password|bank login|payment password|stripe secret|api key|secret key)\b/i.test(
      value
    ) ||
    /(?:\d[ -]?){13,19}/.test(value)
  ) {
    throw new PayAtCloseTriggerValidationError(
      "Closing confirmation must not contain raw payment credentials or sensitive account data."
    );
  }
}
