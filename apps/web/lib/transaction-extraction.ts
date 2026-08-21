import type { TransactionSide } from "./transaction-intake";

export type ExtractionConfidence = "high" | "medium" | "low";

export type TransactionExtractionProposal = {
  clientNames: string[];
  propertyAddress?: string;
  purchasePrice?: number;
  earnestMoney?: number;
  closingDate?: string;
  possession?: string;
  financingType?: string;
  deadlines: Record<string, string>;
  confidence: ExtractionConfidence;
  sourceDocumentId: string;
  sourceDocumentType: string;
  notes?: string[];
};

export class TransactionExtractionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionExtractionValidationError";
  }
}

export function validateTransactionExtractionProposal(
  input: unknown
): TransactionExtractionProposal {
  if (!input || typeof input !== "object") {
    throw new TransactionExtractionValidationError("Extraction proposal must be an object.");
  }

  const value = input as Record<string, unknown>;
  const clientNames = stringArray(value.clientNames, "clientNames");
  const sourceDocumentId = requiredString(value.sourceDocumentId, "sourceDocumentId");
  const sourceDocumentType = requiredString(value.sourceDocumentType, "sourceDocumentType");
  const confidence = requiredConfidence(value.confidence);

  return {
    clientNames,
    propertyAddress: optionalString(value.propertyAddress),
    purchasePrice: optionalPositiveNumber(value.purchasePrice, "purchasePrice"),
    earnestMoney: optionalPositiveNumber(value.earnestMoney, "earnestMoney"),
    closingDate: optionalDateString(value.closingDate, "closingDate"),
    possession: optionalString(value.possession),
    financingType: optionalString(value.financingType),
    deadlines: stringRecord(value.deadlines, "deadlines"),
    confidence,
    sourceDocumentId,
    sourceDocumentType,
    notes: optionalStringArray(value.notes, "notes")
  };
}

export function getExtractionReviewStatus(confidence: ExtractionConfidence): string {
  return confidence === "high" ? "Ready for Review" : "Needs Review";
}

export function buildHouseholdName(clientNames: string[]): string | undefined {
  const names = clientNames.map((name) => name.trim()).filter(Boolean);
  return names.length ? names.join(" & ") : undefined;
}

export function buildConfirmedTransactionName(input: {
  clientName?: string;
  propertyAddress?: string;
  side: TransactionSide;
}): string {
  const anchor = input.propertyAddress ?? input.clientName ?? "New Transaction";
  return `${anchor} — ${input.side === "buyer" ? "Buyer" : "Seller"}`;
}

export function mergeExtractionIntoTransactionData(
  existingData: unknown,
  proposal: TransactionExtractionProposal,
  confirmedAt: string
): Record<string, unknown> {
  const base = isRecord(existingData) ? { ...existingData } : {};

  return {
    ...base,
    propertyAddress: proposal.propertyAddress ?? base.propertyAddress ?? null,
    purchasePrice: proposal.purchasePrice ?? base.purchasePrice ?? null,
    earnestMoney: proposal.earnestMoney ?? base.earnestMoney ?? null,
    closingDate: proposal.closingDate ?? base.closingDate ?? null,
    possession: proposal.possession ?? base.possession ?? null,
    financingType: proposal.financingType ?? base.financingType ?? null,
    deadlines: proposal.deadlines,
    clientNames: proposal.clientNames,
    extraction: {
      status: "confirmed",
      confidence: proposal.confidence,
      sourceDocumentId: proposal.sourceDocumentId,
      sourceDocumentType: proposal.sourceDocumentType,
      confirmedAt,
      notes: proposal.notes ?? []
    }
  };
}

function requiredConfidence(value: unknown): ExtractionConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  throw new TransactionExtractionValidationError("confidence must be high, medium, or low.");
}

function requiredString(value: unknown, field: string): string {
  const normalized = optionalString(value);
  if (!normalized) {
    throw new TransactionExtractionValidationError(`${field} is required.`);
  }
  return normalized;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length ? normalized : undefined;
}

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new TransactionExtractionValidationError(`${field} must be an array.`);
  }

  return value
    .map(optionalString)
    .filter((item): item is string => Boolean(item));
}

function optionalStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  return stringArray(value, field);
}

function stringRecord(value: unknown, field: string): Record<string, string> {
  if (value === undefined || value === null) return {};
  if (!isRecord(value)) {
    throw new TransactionExtractionValidationError(`${field} must be an object.`);
  }

  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = optionalString(key);
    const normalizedValue = optionalString(item);
    if (normalizedKey && normalizedValue) result[normalizedKey] = normalizedValue;
  }
  return result;
}

function optionalPositiveNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new TransactionExtractionValidationError(`${field} must be a non-negative number.`);
  }
  return numeric;
}

function optionalDateString(value: unknown, field: string): string | undefined {
  const normalized = optionalString(value);
  if (!normalized) return undefined;
  const timestamp = Date.parse(normalized);
  if (Number.isNaN(timestamp)) {
    throw new TransactionExtractionValidationError(`${field} must be a valid date.`);
  }
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
