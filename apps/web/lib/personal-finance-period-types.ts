import type {
  PersonalFinanceMonth
} from "./personal-finance-local";

export type PersonalFinancePeriodStatus =
  | "draft"
  | "active"
  | "closed"
  | "archived";

export type PersonalFinancePeriodSourceKind =
  | "imported"
  | "built"
  | "manual";

export type PersonalFinancePeriodSummary = {
  periodKey: string;
  periodLabel: string;
  status: PersonalFinancePeriodStatus;
  sourcePeriodKey: string | null;
  sourceKind: PersonalFinancePeriodSourceKind;
  sourceFile: string | null;
  monthEndGoal: number;
};

export type BuildNextPersonalFinancePeriodOptions = {
  carryBills?: boolean;
  carryAccounts?: boolean;
  carryGoal?: boolean;
};

export type PreparedPersonalFinancePeriodWorkspace = {
  budget: PersonalFinanceMonth | null;
  periodKey: string | null;
  periods: PersonalFinancePeriodSummary[];
  reason: string | null;
};

export function normalizePersonalFinancePeriodKey(
  value: unknown
): string | null {
  if (Array.isArray(value)) {
    return normalizePersonalFinancePeriodKey(
      value[0]
    );
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(
      normalized
    )
  ) {
    return null;
  }

  return normalized;
}
