import type { Prisma } from "@reynalds-os/database";

export const processorPaymentMethodProviders = ["stripe"] as const;
export type ProcessorPaymentMethodProvider =
  (typeof processorPaymentMethodProviders)[number];

export const processorPaymentMethodStatuses = [
  "Pending",
  "Ready",
  "Unavailable"
] as const;
export type ProcessorPaymentMethodStatus =
  (typeof processorPaymentMethodStatuses)[number];

export type ProcessorPaymentMethodReferenceInput = {
  brand?: string;
  customerReference?: string;
  expirationMonth?: number;
  expirationYear?: number;
  last4?: string;
  paymentMethodReference?: string;
  provider: ProcessorPaymentMethodProvider;
  status: ProcessorPaymentMethodStatus;
  verifiedAt?: string;
};

const providerSet = new Set<string>(processorPaymentMethodProviders);
const statusSet = new Set<string>(processorPaymentMethodStatuses);
const blockedSensitiveKeys = new Set([
  "accountnumber",
  "apikey",
  "bankaccount",
  "banklogin",
  "bankpassword",
  "cardnumber",
  "clientsecret",
  "cvc",
  "cvv",
  "pan",
  "routingnumber",
  "secretkey",
  "securitycode",
  "stripesecret"
]);

export function validateProcessorPaymentMethodReference(
  input: unknown
): ProcessorPaymentMethodReferenceInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Processor payment-method reference input must be an object.");
  }

  rejectSensitiveProcessorData(input);

  const value = input as Record<string, unknown>;
  const provider = requiredString(value.provider, "provider");
  const status = requiredString(value.status, "status");

  if (!providerSet.has(provider)) {
    throw new Error("provider must match an approved payment processor.");
  }

  if (!statusSet.has(status)) {
    throw new Error("status must match an approved payment-method reference status.");
  }

  const customerReference = optionalString(value.customerReference);
  const paymentMethodReference = optionalString(value.paymentMethodReference);
  const brand = optionalString(value.brand);
  const last4 = optionalString(value.last4);
  const expirationMonth = optionalInteger(value.expirationMonth, "expirationMonth");
  const expirationYear = optionalInteger(value.expirationYear, "expirationYear");

  if (provider === "stripe") {
    if (customerReference && !/^cus_[A-Za-z0-9]+$/.test(customerReference)) {
      throw new Error("Stripe customerReference must be a safe cus_ processor reference.");
    }

    if (
      paymentMethodReference &&
      !/^pm_[A-Za-z0-9]+$/.test(paymentMethodReference)
    ) {
      throw new Error(
        "Stripe paymentMethodReference must be a safe pm_ processor reference."
      );
    }
  }

  if (status === "Ready" && !paymentMethodReference) {
    throw new Error(
      "paymentMethodReference is required when the payment method is Ready."
    );
  }

  if (brand && brand.length > 40) {
    throw new Error("brand must be 40 characters or fewer.");
  }

  if (last4 && !/^\d{4}$/.test(last4)) {
    throw new Error("last4 must contain exactly four digits.");
  }

  if (
    (expirationMonth === undefined) !== (expirationYear === undefined)
  ) {
    throw new Error(
      "expirationMonth and expirationYear must be recorded together."
    );
  }

  if (
    expirationMonth !== undefined &&
    (expirationMonth < 1 || expirationMonth > 12)
  ) {
    throw new Error("expirationMonth must be between 1 and 12.");
  }

  if (
    expirationYear !== undefined &&
    (expirationYear < 2000 || expirationYear > 3000)
  ) {
    throw new Error("expirationYear must be a four-digit calendar year.");
  }

  return {
    brand,
    customerReference,
    expirationMonth,
    expirationYear,
    last4,
    paymentMethodReference,
    provider: provider as ProcessorPaymentMethodProvider,
    status: status as ProcessorPaymentMethodStatus,
    verifiedAt: optionalIsoDate(value.verifiedAt, "verifiedAt")
  };
}

export function mergeProcessorPaymentMethodProfileData(
  currentData: unknown,
  input: unknown
): Prisma.InputJsonObject {
  const reference = validateProcessorPaymentMethodReference(input);
  const current = toRecord(currentData);
  const existingReference = toRecord(current.processorPaymentMethod);

  return {
    ...current,
    processorPaymentMethod: {
      ...existingReference,
      ...compactReference(reference)
    }
  } as Prisma.InputJsonObject;
}

function compactReference(
  input: ProcessorPaymentMethodReferenceInput
): Prisma.InputJsonObject {
  const data: Record<string, Prisma.InputJsonValue> = {
    provider: input.provider,
    status: input.status
  };

  addOptionalString(data, "brand", input.brand);
  addOptionalString(data, "customerReference", input.customerReference);
  addOptionalNumber(data, "expirationMonth", input.expirationMonth);
  addOptionalNumber(data, "expirationYear", input.expirationYear);
  addOptionalString(data, "last4", input.last4);
  addOptionalString(
    data,
    "paymentMethodReference",
    input.paymentMethodReference
  );
  addOptionalString(data, "verifiedAt", input.verifiedAt);

  return data as Prisma.InputJsonObject;
}

function rejectSensitiveProcessorData(value: unknown): void {
  if (typeof value === "string") {
    if (/(?:\d[ -]?){13,19}/.test(value)) {
      throw new Error(
        "Processor references must not contain raw card or account numbers."
      );
    }

    return;
  }

  if (Array.isArray(value)) {
    value.forEach(rejectSensitiveProcessorData);
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, nestedValue] of Object.entries(
    value as Record<string, unknown>
  )) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (blockedSensitiveKeys.has(normalizedKey)) {
      throw new Error(
        "Processor references must not contain raw payment credentials or processor secrets."
      );
    }

    rejectSensitiveProcessorData(nestedValue);
  }
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new Error(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalInteger(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer.`);
  }

  return value;
}

function optionalIsoDate(value: unknown, fieldName: string): string | undefined {
  const text = optionalString(value);

  if (!text) {
    return undefined;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return date.toISOString();
}

function toRecord(value: unknown): Record<string, Prisma.InputJsonValue> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? ({ ...value } as Record<string, Prisma.InputJsonValue>)
    : {};
}

function addOptionalString(
  data: Record<string, Prisma.InputJsonValue>,
  key: string,
  value: string | undefined
) {
  if (value) {
    data[key] = value;
  }
}

function addOptionalNumber(
  data: Record<string, Prisma.InputJsonValue>,
  key: string,
  value: number | undefined
) {
  if (value !== undefined) {
    data[key] = value;
  }
}
