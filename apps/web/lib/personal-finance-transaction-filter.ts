export const PERSONAL_FINANCE_CLASSIFICATION_FILTER_OPTIONS = [
  ["all", "All"],
  ["unknown", "Unknown"],
  ["expense", "Expense"],
  ["income", "Income"],
  ["refund", "Refund"],
  ["transfer", "Transfer"],
  ["duplicate", "Duplicate"],
  ["ignored", "Ignored"]
] as const;

export type PersonalFinanceClassificationFilter =
  (typeof PERSONAL_FINANCE_CLASSIFICATION_FILTER_OPTIONS)[number][0];

export type PersonalFinanceFilterableTransaction = {
  classification:
    | "unknown"
    | "expense"
    | "income"
    | "refund"
    | "transfer"
    | "duplicate"
    | "ignored";
};

export function filterPersonalFinanceTransactions<
  Transaction extends PersonalFinanceFilterableTransaction
>(
  transactions: readonly Transaction[],
  classificationFilter: PersonalFinanceClassificationFilter
): Transaction[] {
  if (classificationFilter === "all") {
    return [...transactions];
  }

  return transactions.filter(
    (transaction) =>
      transaction.classification ===
      classificationFilter
  );
}

export function getPersonalFinanceClassificationFilterLabel(
  classificationFilter: PersonalFinanceClassificationFilter
): string {
  return (
    PERSONAL_FINANCE_CLASSIFICATION_FILTER_OPTIONS.find(
      ([value]) =>
        value === classificationFilter
    )?.[1] ?? "All"
  );
}
