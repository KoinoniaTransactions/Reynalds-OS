import {
  evaluateTransactionObligation,
  readTransactionObligationData,
  type TransactionObligationRecord
} from "./transaction-obligations";
import type { TransactionSide, TransactionStage } from "./transaction-intake";

export type RealtorTransactionOverview = {
  status: "on_track" | "needs_you" | "attention" | "closing_soon" | "closed" | "processing";
  headline: string;
  summary: string;
  nextMilestone?: string;
  closingDate?: string;
  needsFromRealtor: string[];
};

export type StaffObligationItem = {
  id: string;
  label: string;
  category: string;
  dueDate?: string;
  state: "baseline" | "scheduled" | "due_soon" | "satisfied" | "passed_needs_review" | "superseded" | "not_applicable";
  sequence: number;
  sourceDocumentType?: string;
};

export type StaffTransactionOperations = {
  lifecycle: string;
  needsReview: StaffObligationItem[];
  dueToday: StaffObligationItem[];
  dueSoon: StaffObligationItem[];
  upcoming: StaffObligationItem[];
  completed: number;
  currentObligations: number;
  nextMilestone?: StaffObligationItem;
  closingDate?: string;
};

type ProjectionInput = {
  side?: TransactionSide | null;
  stage?: TransactionStage | null;
  closingDate?: unknown;
  status?: string | null;
  obligations: TransactionObligationRecord[];
  realtorNeeds?: string[];
  now?: Date;
};

export function buildStaffTransactionOperations(input: ProjectionInput): StaffTransactionOperations {
  const now = startOfUtcDay(input.now ?? new Date());
  const current = input.obligations
    .map(toItem)
    .filter((item): item is StaffObligationItem => Boolean(item))
    .filter((item) => item.state !== "superseded" && item.state !== "not_applicable");

  const classified = current.map((item) => ({
    item,
    alert: evaluateTransactionObligation(
      input.obligations.find((record) => record.id === item.id)!,
      now
    )
  }));

  const needsReview = classified
    .filter(({ alert }) => alert?.state === "passed_needs_review")
    .map(({ item }) => ({ ...item, state: "passed_needs_review" as const }))
    .sort(sortByDueDate);

  const dueToday = current
    .filter((item) => isDueToday(item.dueDate, now) && isOpen(item.state))
    .sort(sortByDueDate);

  const dueSoon = classified
    .filter(({ item, alert }) => alert?.state === "due_soon" && !isDueToday(item.dueDate, now))
    .map(({ item }) => ({ ...item, state: "due_soon" as const }))
    .sort(sortByDueDate);

  const upcoming = current
    .filter((item) => {
      if (!item.dueDate || !isOpen(item.state)) return false;
      const days = daysFromNow(item.dueDate, now);
      return days !== null && days > 2;
    })
    .sort(sortByDueDate);

  const openByDate = [...needsReview, ...dueToday, ...dueSoon, ...upcoming]
    .filter((item) => item.dueDate)
    .sort(sortByDueDate);

  return {
    lifecycle: inferLifecycle(input, openByDate, now),
    needsReview,
    dueToday,
    dueSoon,
    upcoming,
    completed: current.filter((item) => item.state === "satisfied").length,
    currentObligations: current.filter((item) => item.state !== "baseline").length,
    nextMilestone: openByDate.find((item) => {
      const days = daysFromNow(item.dueDate, now);
      return days !== null && days >= 0;
    }),
    closingDate: normalizeDate(input.closingDate)
  };
}

export function buildRealtorTransactionOverview(input: ProjectionInput): RealtorTransactionOverview {
  const staff = buildStaffTransactionOperations(input);
  const realtorNeeds = (input.realtorNeeds ?? []).filter(Boolean).slice(0, 3);
  const closingDate = staff.closingDate;

  if (input.status?.toLocaleLowerCase("en-US").includes("closed")) {
    return {
      status: "closed",
      headline: "This transaction is closed.",
      summary: "Koinonia has completed the active transaction workflow for this file.",
      closingDate,
      needsFromRealtor: []
    };
  }

  if (!input.side || !input.stage) {
    return {
      status: "processing",
      headline: "Koinonia is setting up your transaction.",
      summary: "We are reviewing the documents you provided and organizing the file. We will ask only if we need something that cannot be determined from the documents.",
      closingDate,
      needsFromRealtor: realtorNeeds
    };
  }

  if (realtorNeeds.length) {
    return {
      status: "needs_you",
      headline: realtorNeeds.length === 1 ? "We need one thing from you." : `We need ${realtorNeeds.length} things from you.`,
      summary: buildProgressSentence(staff),
      nextMilestone: formatMilestone(staff.nextMilestone),
      closingDate,
      needsFromRealtor: realtorNeeds
    };
  }

  if (staff.needsReview.length) {
    return {
      status: "attention",
      headline: "Koinonia is reviewing an item that needs attention.",
      summary: "We are working through a transaction item that is not fully resolved in the file. Nothing is needed from you right now unless we contact you below.",
      nextMilestone: formatMilestone(staff.nextMilestone),
      closingDate,
      needsFromRealtor: []
    };
  }

  if (closingDate) {
    const days = daysFromNow(closingDate, startOfUtcDay(input.now ?? new Date()));
    if (days !== null && days >= 0 && days <= 7) {
      return {
        status: "closing_soon",
        headline: "Closing is coming up.",
        summary: `Koinonia is managing the final transaction details for closing on ${formatDate(closingDate)}. Nothing is needed from you right now.`,
        nextMilestone: formatMilestone(staff.nextMilestone),
        closingDate,
        needsFromRealtor: []
      };
    }
  }

  return {
    status: "on_track",
    headline: "Your transaction is on track.",
    summary: buildProgressSentence(staff),
    nextMilestone: formatMilestone(staff.nextMilestone),
    closingDate,
    needsFromRealtor: []
  };
}

function toItem(record: TransactionObligationRecord): StaffObligationItem | null {
  const data = readTransactionObligationData(record.data);
  if (!data) return null;
  return {
    id: record.id,
    label: data.label,
    category: data.category,
    dueDate: data.dueDate,
    state: data.state,
    sequence: data.sequence,
    sourceDocumentType: data.sourceDocumentType
  };
}

function inferLifecycle(
  input: ProjectionInput,
  current: StaffObligationItem[],
  now: Date
): string {
  if (input.status?.toLocaleLowerCase("en-US").includes("closed")) return "Closed";
  if (!input.side || !input.stage) return "Transaction Setup";
  if (input.stage === "pre_contract") return input.side === "seller" ? "Listing" : "Buyer Representation";

  const closingDate = normalizeDate(input.closingDate);
  if (closingDate) {
    const days = daysFromNow(closingDate, now);
    if (days !== null && days >= 0 && days <= 7) return "Closing Prep";
  }

  const nextCategory = current.find((item) => {
    const days = daysFromNow(item.dueDate, now);
    return days !== null && days >= 0;
  })?.category;

  if (nextCategory === "inspection") return "Inspection / Due Diligence";
  if (nextCategory === "title" || nextCategory === "hoa") return "Title / Property Review";
  if (nextCategory === "appraisal" || nextCategory === "financing") return "Financing / Appraisal";
  if (nextCategory === "closing" || nextCategory === "possession") return "Closing Prep";
  return "Under Contract";
}

function buildProgressSentence(staff: StaffTransactionOperations): string {
  if (staff.nextMilestone?.dueDate) {
    return `Koinonia is managing the file. The next transaction milestone is ${staff.nextMilestone.label} on ${formatDate(staff.nextMilestone.dueDate)}. Nothing is needed from you right now.`;
  }
  return "Koinonia is managing the transaction details. Nothing is needed from you right now.";
}

function formatMilestone(item?: StaffObligationItem): string | undefined {
  return item?.dueDate ? `${item.label} · ${formatDate(item.dueDate)}` : item?.label;
}

function isOpen(state: StaffObligationItem["state"]): boolean {
  return state === "scheduled" || state === "due_soon" || state === "passed_needs_review";
}

function isDueToday(value: string | undefined, now: Date): boolean {
  const normalized = normalizeDate(value);
  return normalized === now.toISOString().slice(0, 10);
}

function daysFromNow(value: string | undefined, now: Date): number | null {
  const date = normalizeDate(value);
  if (!date) return null;
  const timestamp = new Date(`${date}T00:00:00.000Z`).getTime();
  return Math.floor((timestamp - now.getTime()) / 86_400_000);
}

function sortByDueDate(left: StaffObligationItem, right: StaffObligationItem): number {
  return (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31");
}

function normalizeDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString().slice(0, 10);
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
