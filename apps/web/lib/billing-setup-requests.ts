export const billingSetupRequestObjectType = "BillingSetupRequest";

export type BillingSetupStatus =
  | "Setup Requested"
  | "Consent Needed"
  | "Processor Link Needed"
  | "Payment Method Ready"
  | "Pay at Close Watch"
  | "Blocked";

export type BillingSetupRequestSource = "client-portal" | "employee-portal";

export type BillingSetupRequestInput = {
  amountLabel?: string;
  billingModel: string;
  clientName?: string;
  consentAcknowledged: boolean;
  notes?: string;
  serviceName: string;
  status: BillingSetupStatus;
  triggerDescription?: string;
};

export type BillingSetupStatusUpdateInput = {
  notes?: string;
  paymentMethodSummary?: string;
  processorReference?: string;
  status: BillingSetupStatus;
  triggerDescription?: string;
};

export class BillingSetupValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingSetupValidationError";
  }
}

const allowedStatuses = new Set<BillingSetupStatus>([
  "Setup Requested",
  "Consent Needed",
  "Processor Link Needed",
  "Payment Method Ready",
  "Pay at Close Watch",
  "Blocked"
]);

export function validateBillingSetupRequestInput(input: unknown): BillingSetupRequestInput {
  if (!input || typeof input !== "object") {
    throw new BillingSetupValidationError("Billing setup request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const notes = optionalString(value.notes);

  if (notes && containsPaymentSecretLanguage(notes)) {
    throw new BillingSetupValidationError(
      "Do not include card numbers, CVV codes, bank details, or private payment secrets in billing notes."
    );
  }

  const consentAcknowledged = value.consentAcknowledged === true;

  return {
    amountLabel: optionalString(value.amountLabel),
    billingModel: requiredString(value.billingModel, "billingModel"),
    clientName: optionalString(value.clientName),
    consentAcknowledged,
    notes,
    serviceName: requiredString(value.serviceName, "serviceName"),
    status: normalizeBillingSetupStatus(value.status, consentAcknowledged),
    triggerDescription: optionalString(value.triggerDescription)
  };
}

export function applyBillingSetupRequestSourcePolicy(
  input: BillingSetupRequestInput,
  source: BillingSetupRequestSource
): BillingSetupRequestInput {
  if (source === "employee-portal") {
    return input;
  }

  return {
    ...input,
    status: getClientBillingSetupInitialStatus(input)
  };
}

export function getClientBillingSetupInitialStatus(
  input: Pick<BillingSetupRequestInput, "billingModel" | "consentAcknowledged">
): BillingSetupStatus {
  if (!input.consentAcknowledged) {
    return "Consent Needed";
  }

  const normalizedBillingModel = input.billingModel.trim().toLowerCase();

  if (
    normalizedBillingModel.includes("pay after successful close") ||
    normalizedBillingModel.includes("pay at close") ||
    normalizedBillingModel.includes("pay-at-close")
  ) {
    return "Pay at Close Watch";
  }

  return "Setup Requested";
}

export function validateBillingSetupStatusUpdateInput(
  input: unknown
): BillingSetupStatusUpdateInput {
  if (!input || typeof input !== "object") {
    throw new BillingSetupValidationError("Billing setup update body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const notes = optionalString(value.notes);
  const paymentMethodSummary = optionalString(value.paymentMethodSummary);
  const processorReference = optionalString(value.processorReference);
  const triggerDescription = optionalString(value.triggerDescription);

  if (
    [notes, paymentMethodSummary, processorReference, triggerDescription]
      .filter((item): item is string => Boolean(item))
      .some(containsPaymentSecretLanguage)
  ) {
    throw new BillingSetupValidationError(
      "Do not include card numbers, CVV codes, bank details, or private payment secrets in billing updates."
    );
  }

  return {
    notes,
    paymentMethodSummary,
    processorReference,
    status: normalizeRequiredBillingSetupStatus(value.status),
    triggerDescription
  };
}

export function buildBillingSetupRequestName(input: BillingSetupRequestInput): string {
  return `Billing Setup - ${input.serviceName}`;
}

export function buildBillingSetupNextAction(input: BillingSetupRequestInput): string {
  if (!input.consentAcknowledged) {
    return "Confirm service billing consent before sending a processor-hosted setup link.";
  }

  return buildBillingSetupStatusNextAction(input.status);
}

export function buildBillingSetupStatusNextAction(status: BillingSetupStatus): string {
  switch (status) {
    case "Payment Method Ready":
      return "Review safe payment method metadata and process only approved charges.";
    case "Pay at Close Watch":
      return "Track the closing trigger before billing the approved pay-at-close fee.";
    case "Blocked":
      return "Resolve billing setup blocker before work moves forward.";
    case "Processor Link Needed":
    case "Setup Requested":
    default:
      return "Send a processor-hosted payment setup link and store only safe reference metadata.";
  }
}

export function getBillingSetupHealth(status: BillingSetupStatus): string {
  switch (status) {
    case "Payment Method Ready":
    case "Pay at Close Watch":
      return "Healthy";
    case "Blocked":
      return "Critical";
    case "Consent Needed":
    case "Processor Link Needed":
    case "Setup Requested":
    default:
      return "Attention";
  }
}

export function getHumanBillingSetupStatus(status: string): string {
  switch (status) {
    case "Setup Requested":
    case "Consent Needed":
    case "Processor Link Needed":
    case "Payment Method Ready":
    case "Pay at Close Watch":
    case "Blocked":
      return status;
    default:
      return status;
  }
}

export function getBillingSetupDetail(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Billing setup details needed.";
  }

  const value = data as Record<string, unknown>;
  const billingModel = optionalString(value.billingModel) ?? "Billing model needed";
  const amountLabel = optionalString(value.amountLabel);

  return amountLabel ? `${billingModel} - ${amountLabel}` : billingModel;
}

export function getBillingSetupMetaLabels(data: unknown): string[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["No card stored"];
  }

  const value = data as Record<string, unknown>;
  const labels = ["No card stored"];
  const triggerDescription = optionalString(value.triggerDescription);
  const clientName = optionalString(value.clientName);

  if (triggerDescription) {
    labels.push(triggerDescription);
  }

  if (clientName) {
    labels.push(clientName);
  }

  return labels;
}

function normalizeBillingSetupStatus(
  value: unknown,
  consentAcknowledged: boolean
): BillingSetupStatus {
  const status = optionalString(value) ?? (consentAcknowledged ? "Setup Requested" : "Consent Needed");

  if (!allowedStatuses.has(status as BillingSetupStatus)) {
    throw new BillingSetupValidationError("status must match an approved billing setup status.");
  }

  if (!consentAcknowledged && status !== "Blocked") {
    return "Consent Needed";
  }

  return status as BillingSetupStatus;
}

function normalizeRequiredBillingSetupStatus(value: unknown): BillingSetupStatus {
  const status = optionalString(value);

  if (!status) {
    throw new BillingSetupValidationError("status is required.");
  }

  if (!allowedStatuses.has(status as BillingSetupStatus)) {
    throw new BillingSetupValidationError("status must match an approved billing setup status.");
  }

  return status as BillingSetupStatus;
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new BillingSetupValidationError(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function containsPaymentSecretLanguage(value: string): boolean {
  return /\b(card number|credit card|debit card|cvv|cvc|security code|routing number|account number|bank password|bank login|payment password|stripe secret|api key)\b/i.test(
    value
  );
}
