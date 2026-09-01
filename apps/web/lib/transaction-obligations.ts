import type { TransactionExtractionProposal } from "./transaction-extraction";
import type { TransactionSide, TransactionStage } from "./transaction-intake";

export const transactionObligationObjectType = "TransactionObligation";
export const transactionObligationRelationshipType = "transaction_obligation";

export type TransactionObligationKind = "deadline" | "document" | "action" | "event";
export type TransactionObligationState =
  | "baseline"
  | "scheduled"
  | "due_soon"
  | "satisfied"
  | "passed_needs_review"
  | "superseded"
  | "not_applicable";

export type TransactionObligationData = {
  obligationKey: string;
  label: string;
  kind: TransactionObligationKind;
  category: string;
  dueDate?: string;
  activatedAt: string;
  monitorAfter?: string;
  state: TransactionObligationState;
  sequence: number;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  sourceDocumentIds?: string[];
  evidenceDocumentIds?: string[];
  supersedesObligationId?: string;
  supersededAt?: string;
  supersededBySourceDocumentId?: string;
  satisfiedAt?: string;
  satisfiedReason?: string;
};

export type TransactionObligationSeed = {
  obligationKey: string;
  label: string;
  kind: TransactionObligationKind;
  category: string;
  dueDate?: string;
  activatedAt: string;
  monitorAfter?: string;
  sourceDocumentId: string;
  sourceDocumentType: string;
  isScheduleRevision: boolean;
};

export type TransactionObligationRecord = {
  id: string;
  name: string;
  status: string;
  health: string;
  data: unknown;
};

export type TransactionObligationAlert = {
  obligationId: string;
  obligationKey: string;
  label: string;
  dueDate: string;
  state: "due_soon" | "passed_needs_review";
  title: string;
  detail: string;
  recommendedDocument?: "Listing Contract Amend / Extend" | "Agreement to Amend / Extend";
};

export function deriveConfirmedExtractionObligations(input: {
  side: TransactionSide;
  stage: TransactionStage;
  proposal: TransactionExtractionProposal;
  confirmedDocumentType: string;
  confirmedAt: string;
}): TransactionObligationSeed[] {
  const seeds: TransactionObligationSeed[] = [];
  const scheduleRevision = isScheduleRevisionDocument(input.confirmedDocumentType);

  if (input.side === "seller" && input.proposal.listingExpirationDate) {
    seeds.push(
      buildSeed({
        key: "listing.expiration",
        label: "Listing expiration",
        category: "listing_term",
        dueDate: input.proposal.listingExpirationDate,
        activatedAt: input.confirmedAt,
        sourceDocumentId: input.proposal.sourceDocumentId,
        sourceDocumentType: input.confirmedDocumentType,
        isScheduleRevision: scheduleRevision
      })
    );
  }

  for (const [name, date] of Object.entries(input.proposal.deadlines)) {
    const dueDate = normalizeDate(date);
    if (!dueDate) continue;
    seeds.push(
      buildSeed({
        key: `contract.${normalizeKey(name)}`,
        label: name,
        category: inferDeadlineCategory(name),
        dueDate,
        activatedAt: input.confirmedAt,
        sourceDocumentId: input.proposal.sourceDocumentId,
        sourceDocumentType: input.confirmedDocumentType,
        isScheduleRevision: scheduleRevision
      })
    );
  }

  if (
    input.stage === "under_contract" &&
    input.proposal.closingDate &&
    !seeds.some((seed) => seed.category === "closing")
  ) {
    seeds.push(
      buildSeed({
        key: "contract.closing",
        label: "Closing",
        category: "closing",
        dueDate: input.proposal.closingDate,
        activatedAt: input.confirmedAt,
        sourceDocumentId: input.proposal.sourceDocumentId,
        sourceDocumentType: input.confirmedDocumentType,
        isScheduleRevision: scheduleRevision
      })
    );
  }

  return dedupeSeeds(seeds);
}

export function readTransactionObligationData(value: unknown): TransactionObligationData | null {
  if (!isRecord(value)) return null;
  if (typeof value.obligationKey !== "string" || typeof value.label !== "string") return null;
  if (typeof value.activatedAt !== "string" || typeof value.sequence !== "number") return null;
  const kind = value.kind;
  const state = value.state;
  if (!isKind(kind) || !isState(state)) return null;

  return {
    obligationKey: value.obligationKey,
    label: value.label,
    kind,
    category: typeof value.category === "string" ? value.category : "general",
    dueDate: typeof value.dueDate === "string" ? value.dueDate : undefined,
    activatedAt: value.activatedAt,
    monitorAfter: typeof value.monitorAfter === "string" ? value.monitorAfter : undefined,
    state,
    sequence: value.sequence,
    sourceDocumentId: typeof value.sourceDocumentId === "string" ? value.sourceDocumentId : undefined,
    sourceDocumentType: typeof value.sourceDocumentType === "string" ? value.sourceDocumentType : undefined,
    sourceDocumentIds: stringArray(value.sourceDocumentIds),
    evidenceDocumentIds: stringArray(value.evidenceDocumentIds),
    supersedesObligationId:
      typeof value.supersedesObligationId === "string" ? value.supersedesObligationId : undefined,
    supersededAt: typeof value.supersededAt === "string" ? value.supersededAt : undefined,
    supersededBySourceDocumentId:
      typeof value.supersededBySourceDocumentId === "string" ? value.supersededBySourceDocumentId : undefined,
    satisfiedAt: typeof value.satisfiedAt === "string" ? value.satisfiedAt : undefined,
    satisfiedReason: typeof value.satisfiedReason === "string" ? value.satisfiedReason : undefined
  };
}

export function evaluateTransactionObligation(
  record: TransactionObligationRecord,
  now = new Date()
): TransactionObligationAlert | null {
  const data = readTransactionObligationData(record.data);
  if (!data?.dueDate) return null;
  if (["satisfied", "superseded", "not_applicable", "baseline"].includes(data.state)) return null;

  const dueDay = dayValue(data.dueDate);
  const nowDay = startOfUtcDay(now).getTime();
  const monitorDay = data.monitorAfter ? dayValue(data.monitorAfter) : dayValue(data.activatedAt);
  if (dueDay === null || monitorDay === null) return null;

  // A contract received after a deadline has already passed establishes historical baseline only.
  // It must not immediately manufacture an Amend / Extend request during intake.
  if (dueDay < monitorDay) return null;

  const daysUntil = Math.floor((dueDay - nowDay) / 86_400_000);
  if (daysUntil < 0) {
    return {
      obligationId: record.id,
      obligationKey: data.obligationKey,
      label: data.label,
      dueDate: data.dueDate,
      state: "passed_needs_review",
      title: `${data.label} needs review`,
      detail: `${data.label} passed on ${formatDate(data.dueDate)} with no recorded completion or later schedule revision. Confirm what happened before Koinonia requests corrective documentation.`,
      recommendedDocument: amendmentRecommendation(data)
    };
  }

  if (daysUntil <= 2) {
    return {
      obligationId: record.id,
      obligationKey: data.obligationKey,
      label: data.label,
      dueDate: data.dueDate,
      state: "due_soon",
      title: `${data.label} is due soon`,
      detail: `${data.label} is due ${formatDate(data.dueDate)}. Koinonia is waiting for completion evidence or a schedule change.`,
      recommendedDocument: undefined
    };
  }

  return null;
}

export function isScheduleRevisionDocument(documentType: string): boolean {
  const normalized = documentType.toLocaleLowerCase("en-US");
  return (
    normalized.includes("amend") ||
    normalized.includes("extend") ||
    normalized.includes("counterproposal") ||
    normalized.includes("counter proposal") ||
    normalized.includes("revive")
  );
}

export function obligationStatusFromState(state: TransactionObligationState): string {
  if (state === "satisfied") return "Satisfied";
  if (state === "superseded") return "Superseded";
  if (state === "not_applicable") return "Not Applicable";
  if (state === "baseline") return "Baseline";
  if (state === "passed_needs_review") return "Needs Review";
  if (state === "due_soon") return "Due Soon";
  return "Scheduled";
}

export function obligationHealthFromState(state: TransactionObligationState): string {
  return state === "passed_needs_review" ? "Attention" : "Healthy";
}

function buildSeed(input: {
  key: string;
  label: string;
  category: string;
  dueDate: string;
  activatedAt: string;
  sourceDocumentId: string;
  sourceDocumentType: string;
  isScheduleRevision: boolean;
}): TransactionObligationSeed {
  const activatedDay = normalizeDate(input.activatedAt) ?? input.activatedAt.slice(0, 10);
  const dueDay = normalizeDate(input.dueDate) ?? input.dueDate;
  return {
    obligationKey: input.key,
    label: input.label,
    kind: "deadline",
    category: input.category,
    dueDate: dueDay,
    activatedAt: input.activatedAt,
    monitorAfter: activatedDay,
    sourceDocumentId: input.sourceDocumentId,
    sourceDocumentType: input.sourceDocumentType,
    isScheduleRevision: input.isScheduleRevision
  };
}

function amendmentRecommendation(
  data: TransactionObligationData
): TransactionObligationAlert["recommendedDocument"] {
  return data.category === "listing_term"
    ? "Listing Contract Amend / Extend"
    : "Agreement to Amend / Extend";
}

function inferDeadlineCategory(name: string): string {
  const value = name.toLocaleLowerCase("en-US");
  if (value.includes("inspection")) return "inspection";
  if (value.includes("title")) return "title";
  if (value.includes("apprais")) return "appraisal";
  if (value.includes("loan") || value.includes("financ")) return "financing";
  if (value.includes("earnest")) return "earnest_money";
  if (value.includes("association") || value.includes("hoa")) return "hoa";
  if (value.includes("closing")) return "closing";
  if (value.includes("possession")) return "possession";
  return "contract_deadline";
}

function normalizeKey(value: string): string {
  const normalized = value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return normalized || "deadline";
}

function normalizeDate(value: string): string | null {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function dayValue(value: string): number | null {
  const normalized = normalizeDate(value);
  if (!normalized) return null;
  return new Date(`${normalized}T00:00:00.000Z`).getTime();
}

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function dedupeSeeds(seeds: TransactionObligationSeed[]): TransactionObligationSeed[] {
  const byKey = new Map<string, TransactionObligationSeed>();
  for (const seed of seeds) byKey.set(`${seed.obligationKey}:${seed.dueDate ?? ""}`, seed);
  return [...byKey.values()];
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  return strings.length ? strings : undefined;
}

function isKind(value: unknown): value is TransactionObligationKind {
  return value === "deadline" || value === "document" || value === "action" || value === "event";
}

function isState(value: unknown): value is TransactionObligationState {
  return (
    value === "baseline" ||
    value === "scheduled" ||
    value === "due_soon" ||
    value === "satisfied" ||
    value === "passed_needs_review" ||
    value === "superseded" ||
    value === "not_applicable"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
