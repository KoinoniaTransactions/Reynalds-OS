export type PersonalFinanceReconciliationAccountKind =
  | "cash"
  | "credit";

export type PersonalFinanceReconciliationAccount = {
  accountKey: string;
  name: string;

  kind:
    PersonalFinanceReconciliationAccountKind;

  openingBalance: number;
  currentBalance: number;

  closingBalance:
    number | null;

  reconciledAt:
    string | null;

  creditLimit:
    number | null;

  minimumPayment:
    number | null;
};

export type PersonalFinanceBillPaymentSourceKind =
  | "ordinary"
  | "debt";

export type PersonalFinanceBillPayment = {
  id: string;
  periodKey: string;
  budgetItemKey: string;
  amount: number;
  paidOn: string;

  note:
    string | null;

  sourceKind:
    PersonalFinanceBillPaymentSourceKind;

  sourcePaymentId:
    string | null;

  createdAt: string;
};

export type PersonalFinanceReconciliationBill = {
  budgetItemKey: string;
  name: string;
  planned: number;
  paid: number;
  remaining: number;

  dueDate:
    string | null;

  dueLabel: string;
  paymentMethod: string;

  requiresDebtLedger:
    boolean;

  debtLedgerLabel:
    string | null;

  payments:
    PersonalFinanceBillPayment[];
};

export type PersonalFinanceReconciliationWorkspace = {
  periodKey: string;
  periodLabel: string;

  accounts:
    PersonalFinanceReconciliationAccount[];

  bills:
    PersonalFinanceReconciliationBill[];

  totals: {
    openingCash: number;
    currentCash: number;

    closedCash:
      number | null;

    plannedBills: number;
    paidBills: number;
    remainingBills: number;

    recordedPayments: number;
  };
};

export type UpdatePersonalFinanceAccountBalanceInput = {
  accountKey: unknown;
  balance: unknown;
};

export type RecordPersonalFinanceBillPaymentInput = {
  budgetItemKey: unknown;
  amount: unknown;
  paidOn: unknown;

  note?:
    unknown;
};

export type UpdatePersonalFinanceBillPaymentInput = {
  paymentId: unknown;
  amount: unknown;
  paidOn: unknown;

  note?:
    unknown;
};

export type DeletePersonalFinanceBillPaymentInput = {
  paymentId: unknown;
};

export type SyncPersonalFinanceDebtPaymentInput = {
  obligationId: unknown;
  paymentId: unknown;
  amount: unknown;
  paidOn: unknown;

  note?:
    unknown;
};
