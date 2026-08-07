export type PersonalFinanceIncomeSchedule =
  | "weekly"
  | "biweekly"
  | "semimonthly"
  | "monthly"
  | "irregular";

export type PersonalFinanceIncomeSourceType =
  | "employment"
  | "self_employment"
  | "retirement"
  | "benefit"
  | "other";

export type PersonalFinanceIncomeOccurrenceKind =
  | "scheduled"
  | "misc"
  | "imported";

export type PersonalFinanceIncomeOccurrenceStatus =
  | "pending"
  | "partial"
  | "received";

export type PersonalFinanceIncomeSource = {
  id: string;
  recipientName: string;
  sourceName: string;

  sourceType:
    PersonalFinanceIncomeSourceType;

  schedule:
    PersonalFinanceIncomeSchedule;

  expectedAmount: number;

  anchorDate:
    string | null;

  secondPayDay:
    number | null;

  activeFromPeriod:
    string;

  endPeriod:
    string | null;

  depositAccountLabel:
    string | null;

  notes:
    string | null;

  isActive:
    boolean;
};

export type PersonalFinanceIncomeOccurrence = {
  id: string;

  sourceId:
    string | null;

  periodKey:
    string;

  kind:
    PersonalFinanceIncomeOccurrenceKind;

  label:
    string;

  recipientName:
    string;

  expectedDate:
    string;

  expected:
    number;

  received:
    number;

  remaining:
    number;

  receivedDate:
    string | null;

  notes:
    string | null;

  status:
    PersonalFinanceIncomeOccurrenceStatus;
};

export type PersonalFinanceIncomeWorkspaceData = {
  periodKey: string;
  periodLabel: string;

  sources:
    PersonalFinanceIncomeSource[];

  occurrences:
    PersonalFinanceIncomeOccurrence[];

  totals: {
    expected: number;
    received: number;
    pending: number;
    upcoming: number;
  };

  importedCount:
    number;

  miscCount:
    number;
};

export type CreatePersonalFinanceIncomeSourceInput = {
  recipientName: unknown;
  sourceName: unknown;
  sourceType: unknown;
  schedule: unknown;
  expectedAmount: unknown;

  anchorDate?:
    unknown;

  secondPayDay?:
    unknown;

  activeFromPeriod?:
    unknown;

  endPeriod?:
    unknown;

  depositAccountLabel?:
    unknown;

  notes?:
    unknown;
};

export type UpdatePersonalFinanceIncomeSourceInput =
  CreatePersonalFinanceIncomeSourceInput & {
    sourceId:
      unknown;
  };

export type SetPersonalFinanceIncomeSourceActiveInput = {
  sourceId:
    unknown;

  isActive:
    unknown;
};

export type DeletePersonalFinanceIncomeSourceInput = {
  sourceId:
    unknown;
};

export type CreatePersonalFinanceMiscIncomeInput = {
  label: unknown;
  recipientName: unknown;
  expectedAmount: unknown;
  expectedDate: unknown;

  receivedAmount?:
    unknown;

  receivedDate?:
    unknown;

  notes?:
    unknown;
};

export type UpdatePersonalFinanceIncomeReceiptInput = {
  occurrenceId: unknown;
  receivedAmount: unknown;

  receivedDate?:
    unknown;
};
