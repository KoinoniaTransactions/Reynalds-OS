import type { TransactionSide } from "./transaction-intake";
import type { TransactionFacts } from "./transaction-document-requirements";

export type ExtractionConfidence = "high" | "medium" | "low";
export type DocumentMatch = "match" | "mismatch" | "uncertain";

export type ExtractedRequirementFacts = Pick<
  TransactionFacts,
  "propertyUse" | "yearBuilt" | "inHoa" | "manufacturedHome" | "shortSale" | "hasCounterproposal"
>;

export type TransactionExtractionProposal = {
  clientNames: string[];
  propertyAddress?: string;
  identifiedDocumentType: string;
  documentRequirementId?: string;
  requirementFacts?: ExtractedRequirementFacts;
  listPrice?: number;
  listingEffectiveDate?: string;
  listingExpirationDate?: string;
  brokerageName?: string;
  agentName?: string;
  purchasePrice?: number;
  earnestMoney?: number;
  closingDate?: string;
  possession?: string;
  financingType?: string;
  deadlines: Record<string, string>;
  confidence: ExtractionConfidence;
  documentMatch: DocumentMatch;
  documentMatchReason?: string;
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
  const documentMatch = optionalDocumentMatch(value.documentMatch);

  return {
    clientNames,
    propertyAddress: optionalString(value.propertyAddress),
    identifiedDocumentType: optionalString(value.identifiedDocumentType) ?? sourceDocumentType,
    documentRequirementId: optionalString(value.documentRequirementId),
    requirementFacts: optionalExtractedRequirementFacts(value.requirementFacts),
    listPrice: optionalPositiveNumber(value.listPrice, "listPrice"),
    listingEffectiveDate: optionalDateString(value.listingEffectiveDate, "listingEffectiveDate"),
    listingExpirationDate: optionalDateString(value.listingExpirationDate, "listingExpirationDate"),
    brokerageName: optionalString(value.brokerageName),
    agentName: optionalString(value.agentName),
    purchasePrice: optionalPositiveNumber(value.purchasePrice, "purchasePrice"),
    earnestMoney: optionalPositiveNumber(value.earnestMoney, "earnestMoney"),
    closingDate: optionalDateString(value.closingDate, "closingDate"),
    possession: optionalString(value.possession),
    financingType: optionalString(value.financingType),
    deadlines: stringRecord(value.deadlines, "deadlines"),
    confidence,
    documentMatch,
    documentMatchReason: optionalString(value.documentMatchReason),
    sourceDocumentId,
    sourceDocumentType,
    notes: optionalStringArray(value.notes, "notes")
  };
}

export function getExtractionReviewStatus(
  confidence: ExtractionConfidence,
  documentMatch: DocumentMatch = "match"
): string {
  if (documentMatch === "mismatch") return "Wrong Document";
  if (documentMatch === "uncertain") return "Needs Review";
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
  const existingRequirementFacts = isRecord(base.requirementFacts) ? base.requirementFacts : {};
  const derivedFinancingType = normalizeFinancingFact(proposal.financingType);
  const nextRequirementFacts = {
    ...existingRequirementFacts,
    ...(proposal.requirementFacts ?? {}),
    ...(derivedFinancingType ? { financingType: derivedFinancingType } : {})
  };

  return {
    ...base,
    propertyAddress: proposal.propertyAddress ?? base.propertyAddress ?? null,
    listPrice: proposal.listPrice ?? base.listPrice ?? null,
    listingEffectiveDate: proposal.listingEffectiveDate ?? base.listingEffectiveDate ?? null,
    listingExpirationDate: proposal.listingExpirationDate ?? base.listingExpirationDate ?? null,
    brokerageName: proposal.brokerageName ?? base.brokerageName ?? null,
    agentName: proposal.agentName ?? base.agentName ?? null,
    purchasePrice: proposal.purchasePrice ?? base.purchasePrice ?? null,
    earnestMoney: proposal.earnestMoney ?? base.earnestMoney ?? null,
    closingDate: proposal.closingDate ?? base.closingDate ?? null,
    possession: proposal.possession ?? base.possession ?? null,
    financingType: proposal.financingType ?? base.financingType ?? null,
    deadlines: proposal.deadlines,
    clientNames: proposal.clientNames,
    requirementFacts: nextRequirementFacts,
    extraction: {
      status: "confirmed",
      confidence: proposal.confidence,
      documentMatch: proposal.documentMatch,
      documentMatchReason: proposal.documentMatchReason ?? null,
      identifiedDocumentType: proposal.identifiedDocumentType,
      documentRequirementId: proposal.documentRequirementId ?? null,
      requirementFacts: proposal.requirementFacts ?? {},
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

function optionalDocumentMatch(value: unknown): DocumentMatch {
  if (value === undefined || value === null) return "match";
  if (value === "match" || value === "mismatch" || value === "uncertain") return value;

  throw new TransactionExtractionValidationError(
    "documentMatch must be match, mismatch, or uncertain."
  );
}

function optionalExtractedRequirementFacts(value: unknown): ExtractedRequirementFacts | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) {
    throw new TransactionExtractionValidationError("requirementFacts must be an object.");
  }

  const result: ExtractedRequirementFacts = {};
  const propertyUse = value.propertyUse;
  if (
    propertyUse === "residential" ||
    propertyUse === "income_residential" ||
    propertyUse === "land" ||
    propertyUse === "commercial"
  ) result.propertyUse = propertyUse;

  if (value.yearBuilt !== undefined && value.yearBuilt !== null) {
    const yearBuilt = Number(value.yearBuilt);
    if (!Number.isInteger(yearBuilt) || yearBuilt < 1600 || yearBuilt > new Date().getFullYear() + 1) {
      throw new TransactionExtractionValidationError("requirementFacts.yearBuilt must be a valid year.");
    }
    result.yearBuilt = yearBuilt;
  }

  for (const key of ["inHoa", "manufacturedHome", "shortSale", "hasCounterproposal"] as const) {
    const item = value[key];
    if (item === true || item === false) result[key] = item;
  }

  return Object.keys(result).length ? result : undefined;
}

function normalizeFinancingFact(value: string | undefined): TransactionFacts["financingType"] | undefined {
  if (!value) return undefined;
  const normalized = value.toLocaleLowerCase("en-US");
  if (normalized.includes("cash")) return "cash";
  if (normalized.includes("owner") || normalized.includes("seller")) return "owner_carry";
  if (
    normalized.includes("loan") ||
    normalized.includes("conventional") ||
    normalized.includes("fha") ||
    normalized.includes("va")
  ) return "loan";
  return undefined;
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
