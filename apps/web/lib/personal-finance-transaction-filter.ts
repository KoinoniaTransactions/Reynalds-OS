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

export const PERSONAL_FINANCE_REVIEWED_FILTER_OPTIONS = [
  ["all", "All"],
  ["not-reviewed", "Not reviewed"],
  ["reviewed", "Reviewed"]
] as const;

export type PersonalFinanceReviewedFilter =
  (typeof PERSONAL_FINANCE_REVIEWED_FILTER_OPTIONS)[number][0];

export type PersonalFinanceFilterableTransaction = {
  classification:
    | "unknown"
    | "expense"
    | "income"
    | "refund"
    | "transfer"
    | "duplicate"
    | "ignored";
  reviewedAt: string | null;
};

export function filterPersonalFinanceTransactions<
  Transaction extends PersonalFinanceFilterableTransaction
>(
  transactions: readonly Transaction[],
  classificationFilter: PersonalFinanceClassificationFilter,
  reviewedFilter: PersonalFinanceReviewedFilter = "all"
): Transaction[] {
  return transactions.filter((transaction) => {
    const matchesClassification =
      classificationFilter === "all" ||
      transaction.classification ===
        classificationFilter;

    const isReviewed =
      transaction.reviewedAt !== null;

    const matchesReviewed =
      reviewedFilter === "all" ||
      (
        reviewedFilter === "reviewed"
          ? isReviewed
          : !isReviewed
      );

    return (
      matchesClassification &&
      matchesReviewed
    );
  });
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

export function getPersonalFinanceReviewedFilterLabel(
  reviewedFilter: PersonalFinanceReviewedFilter
): string {
  return (
    PERSONAL_FINANCE_REVIEWED_FILTER_OPTIONS.find(
      ([value]) =>
        value === reviewedFilter
    )?.[1] ?? "All"
  );
}
