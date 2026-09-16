import type { TransactionSide, TransactionStage } from "./transaction-intake";

export type DeadlineHealthAlert = {
  kind: "listing_expired" | "contract_deadline_passed";
  title: string;
  detail: string;
  deadlineName: string;
  deadlineDate: string;
  recommendedDocument: "Listing Contract Amend / Extend" | "Agreement to Amend / Extend";
};

export type TransactionDeadlineHealth = {
  status: "clear" | "review";
  alerts: DeadlineHealthAlert[];
};

type EvaluateInput = {
  side: TransactionSide;
  stage: TransactionStage;
  listingExpirationDate?: unknown;
  deadlines?: unknown;
  now?: Date;
};

export function evaluateTransactionDeadlineHealth(input: EvaluateInput): TransactionDeadlineHealth {
  const now = startOfUtcDay(input.now ?? new Date());
  const alerts: DeadlineHealthAlert[] = [];

  if (input.side === "seller") {
    const listingExpiration = validDateString(input.listingExpirationDate);
    if (listingExpiration && isBeforeDay(listingExpiration, now)) {
      alerts.push({
        kind: "listing_expired",
        title: "Review Listing Amend / Extend",
        detail:
          "The current listing expiration date has passed. Confirm whether the listing was extended, ended, or otherwise resolved before requesting an amendment.",
        deadlineName: "Listing expiration",
        deadlineDate: listingExpiration,
        recommendedDocument: "Listing Contract Amend / Extend"
      });
    }
  }

  if (input.stage === "under_contract") {
    for (const [name, value] of Object.entries(asStringRecord(input.deadlines))) {
      const date = validDateString(value);
      if (!date || !isBeforeDay(date, now)) continue;

      alerts.push({
        kind: "contract_deadline_passed",
        title: "Review Amend / Extend",
        detail:
          `${name} passed on ${formatDate(date)}. Confirm whether the obligation was completed on time or whether the contract needs an Amend / Extend.`,
        deadlineName: name,
        deadlineDate: date,
        recommendedDocument: "Agreement to Amend / Extend"
      });
    }
  }

  return {
    status: alerts.length ? "review" : "clear",
    alerts: dedupeAlerts(alerts)
  };
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "string" && item.trim()) result[key] = item.trim();
  }
  return result;
}

function validDateString(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isBeforeDay(value: string, comparison: Date): boolean {
  return new Date(`${value}T00:00:00.000Z`).getTime() < comparison.getTime();
}

function startOfUtcDay(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function dedupeAlerts(alerts: DeadlineHealthAlert[]): DeadlineHealthAlert[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    const key = `${alert.kind}:${alert.deadlineName}:${alert.deadlineDate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
