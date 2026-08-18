export const portalInvoiceStatuses = [
  "Draft",
  "Open",
  "Due Before Work Begins",
  "Pay at Close Watch",
  "Ready to Process",
  "Processing",
  "Paid",
  "Payment Failed",
  "Refunded",
  "Void"
] as const;

export type PortalInvoiceStatus = (typeof portalInvoiceStatuses)[number];

export type PortalInvoiceStatusUpdateInput = {
  dueAt?: Date;
  notes?: string;
  paidAt?: Date;
  paymentMethodSummary?: string;
  processorPaymentReference?: string;
  status: PortalInvoiceStatus;
};

export type PortalInvoiceSource = {
  amount: unknown;
  clientObjectId: string;
  createdAt?: Date | string;
  dueAt?: Date | string | null;
  id: string;
  packageObjectId?: string | null;
  paidAt?: Date | string | null;
  relatedObjectId?: string | null;
  status: string;
};

export type PortalInvoiceDisplayItem = {
  amount: string;
  due: string;
  id: string;
  invoice: string;
  nextAction: string;
  service: string;
  status: string;
};

export class PortalInvoiceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortalInvoiceValidationError";
  }
}

const allowedStatuses = new Set<string>(portalInvoiceStatuses);

export function validatePortalInvoiceStatusUpdateInput(
  input: unknown
): PortalInvoiceStatusUpdateInput {
  if (!input || typeof input !== "object") {
    throw new PortalInvoiceValidationError("Invoice status update body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const notes = optionalString(value.notes);
  const paymentMethodSummary = optionalString(value.paymentMethodSummary);
  const processorPaymentReference = optionalString(value.processorPaymentReference);

  if (
    [notes, paymentMethodSummary, processorPaymentReference]
      .filter((item): item is string => Boolean(item))
      .some(containsPaymentSecretLanguage)
  ) {
    throw new PortalInvoiceValidationError(
      "Do not include card numbers, CVV codes, bank details, or private payment secrets in invoice updates."
    );
  }

  return {
    dueAt: optionalDate(value.dueAt, "dueAt"),
    notes,
    paidAt: optionalDate(value.paidAt, "paidAt"),
    paymentMethodSummary,
    processorPaymentReference,
    status: normalizePortalInvoiceStatus(value.status)
  };
}

export function buildPortalInvoiceDisplayItem(
  invoice: PortalInvoiceSource,
  objectNames: Map<string, string>
): PortalInvoiceDisplayItem {
  const relatedName = getInvoiceRelatedName(invoice, objectNames);
  const status = getHumanPortalInvoiceStatus(invoice.status);

  return {
    amount: formatPortalInvoiceAmount(invoice.amount),
    due: getPortalInvoiceDueLabel(invoice),
    id: invoice.id,
    invoice: formatPortalInvoiceLabel(invoice.id),
    nextAction: buildPortalInvoiceNextAction(status),
    service: relatedName,
    status
  };
}

export function buildPortalInvoiceNextAction(status: string): string {
  switch (getHumanPortalInvoiceStatus(status)) {
    case "Draft":
      return "Confirm service scope, billing model, and client authorization before sending.";
    case "Due Before Work Begins":
      return "Collect payment or record an approved exception before billable work begins.";
    case "Pay at Close Watch":
      return "Wait for a confirmed successful closing before charging this invoice.";
    case "Ready to Process":
      return "Verify consent, payment method readiness, and service completion before processing.";
    case "Processing":
      return "Wait for the processor result before marking this invoice final.";
    case "Paid":
      return "Confirm the payment record and keep the invoice available for client reference.";
    case "Payment Failed":
      return "Contact the client with a secure processor-hosted retry path.";
    case "Refunded":
      return "Confirm the refund reason and keep the processor reference in the audit trail.";
    case "Void":
      return "Keep the voided invoice visible for audit history.";
    case "Open":
    default:
      return "Monitor due date, payment setup, and client authorization.";
  }
}

export function getHumanPortalInvoiceStatus(status: string): PortalInvoiceStatus {
  switch (status) {
    case "Pending":
      return "Open";
    case "Waiting on Successful Closing":
      return "Pay at Close Watch";
    case "Paid":
    case "Draft":
    case "Open":
    case "Due Before Work Begins":
    case "Pay at Close Watch":
    case "Ready to Process":
    case "Processing":
    case "Payment Failed":
    case "Refunded":
    case "Void":
      return status;
    default:
      return "Open";
  }
}

export function getPaymentRecordStatus(status: PortalInvoiceStatus): string | null {
  switch (status) {
    case "Paid":
      return "Succeeded";
    case "Payment Failed":
      return "Failed";
    case "Refunded":
      return "Refunded";
    default:
      return null;
  }
}

export function getPortalInvoiceDueLabel(invoice: Pick<PortalInvoiceSource, "dueAt" | "paidAt" | "status">): string {
  const paidAt = toDate(invoice.paidAt);

  if (paidAt) {
    return `Paid ${formatPortalInvoiceDate(paidAt)}`;
  }

  const status = getHumanPortalInvoiceStatus(invoice.status);

  if (status === "Pay at Close Watch") {
    return "After close";
  }

  const dueAt = toDate(invoice.dueAt);

  if (!dueAt) {
    return "Due date needed";
  }

  const today = startOfDay(new Date());
  const dueDay = startOfDay(dueAt);
  const label = formatPortalInvoiceDate(dueAt);

  if (dueDay.getTime() < today.getTime()) {
    return `Past due since ${label}`;
  }

  return `Due ${label}`;
}

export function formatPortalInvoiceAmount(amount: unknown): string {
  const value =
    typeof amount === "number"
      ? amount
      : Number(typeof amount === "object" && amount && "toString" in amount ? amount.toString() : amount);

  if (!Number.isFinite(value)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value);
}

export function formatPortalInvoiceLabel(id: string): string {
  const suffix = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();

  return suffix ? `INV-${suffix}` : "Invoice";
}

function normalizePortalInvoiceStatus(value: unknown): PortalInvoiceStatus {
  const status = optionalString(value);

  if (!status) {
    throw new PortalInvoiceValidationError("status is required.");
  }

  if (!allowedStatuses.has(status)) {
    throw new PortalInvoiceValidationError("Invoice status is not supported.");
  }

  return status as PortalInvoiceStatus;
}

function getInvoiceRelatedName(invoice: PortalInvoiceSource, objectNames: Map<string, string>): string {
  const ids = [invoice.relatedObjectId, invoice.packageObjectId, invoice.clientObjectId].filter(
    (id): id is string => Boolean(id)
  );

  for (const id of ids) {
    const name = objectNames.get(id);

    if (name) {
      return name;
    }
  }

  return "Client billing file";
}

function formatPortalInvoiceDate(value: Date): string {
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalDate(value: unknown, fieldName: string): Date | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new PortalInvoiceValidationError(`${fieldName} must be a valid date.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new PortalInvoiceValidationError(`${fieldName} must be a valid date.`);
  }

  return date;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function containsPaymentSecretLanguage(value: string): boolean {
  return (
    /\b(card number|credit card|debit card|cvv|cvc|security code|routing number|account number|bank password|bank login|payment password|stripe secret|api key|secret key)\b/i.test(
      value
    ) || /(?:\d[ -]?){13,19}/.test(value)
  );
}
