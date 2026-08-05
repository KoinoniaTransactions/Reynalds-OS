import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import {
  getPersonalFinanceDatabasePath,
  openPersonalFinanceDatabase,
  type PersonalFinanceClassification,
  type PersonalFinanceReviewStatus
} from "./personal-finance-db-local";

export type UpdatePersonalFinanceTransactionReviewedOptions = {
  transactionId: string;
  reviewed: boolean;
  databasePath?: string;
};

export type PersonalFinanceTransactionReviewedUpdate = {
  transactionId: string;
  changed: boolean;
  previousReviewedAt: string | null;
  reviewedAt: string | null;
  classification: PersonalFinanceClassification;
  reviewStatus: PersonalFinanceReviewStatus;
  transactionLinkCount: number;
  budgetAllocationCount: number;
};

type TransactionStateRow = {
  id: string;
  classification: PersonalFinanceClassification;
  review_status: PersonalFinanceReviewStatus;
  reviewed_at: string | null;
  transaction_link_count: number;
  budget_allocation_count: number;
};

function normalizedTransactionId(
  value: string
): string {
  const transactionId = value.trim();

  if (!transactionId) {
    throw new Error(
      "A Personal Finance transaction ID is required."
    );
  }

  return transactionId;
}

function assertLocalPersonalFinanceEnabled(): void {
  if (
    process.env.ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local personal finance is disabled."
    );
  }
}

function readTransactionState(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  transactionId: string
): TransactionStateRow | undefined {
  return database
    .prepare(`
      SELECT
        t.id,
        t.classification,
        t.review_status,
        t.reviewed_at,

        (
          SELECT COUNT(*)
          FROM transaction_links link
          WHERE
            link.transaction_a_id = t.id OR
            link.transaction_b_id = t.id
        ) AS transaction_link_count,

        (
          SELECT COUNT(*)
          FROM budget_allocations allocation
          WHERE allocation.transaction_id = t.id
        ) AS budget_allocation_count

      FROM transactions t
      WHERE t.id = ?
    `)
    .get(transactionId) as
    | TransactionStateRow
    | undefined;
}

function resultFromState({
  transactionId,
  changed,
  previousReviewedAt,
  state
}: {
  transactionId: string;
  changed: boolean;
  previousReviewedAt: string | null;
  state: TransactionStateRow;
}): PersonalFinanceTransactionReviewedUpdate {
  return {
    transactionId,
    changed,
    previousReviewedAt,
    reviewedAt: state.reviewed_at,
    classification: state.classification,
    reviewStatus: state.review_status,
    transactionLinkCount:
      state.transaction_link_count,
    budgetAllocationCount:
      state.budget_allocation_count
  };
}

export function updatePersonalFinanceTransactionReviewed(
  options: UpdatePersonalFinanceTransactionReviewedOptions
): PersonalFinanceTransactionReviewedUpdate {
  assertLocalPersonalFinanceEnabled();

  const transactionId = normalizedTransactionId(
    options.transactionId
  );

  if (typeof options.reviewed !== "boolean") {
    throw new Error(
      "A Personal Finance reviewed state is required."
    );
  }

  const databasePath = path.resolve(
    options.databasePath ??
      getPersonalFinanceDatabasePath()
  );

  if (!existsSync(databasePath)) {
    throw new Error(
      "The private Personal Finance database was not found."
    );
  }

  const database = openPersonalFinanceDatabase({
    databasePath
  });

  try {
    const updateTransaction =
      database.transaction(() => {
        const before = readTransactionState(
          database,
          transactionId
        );

        if (!before) {
          throw new Error(
            "The Personal Finance transaction was not found."
          );
        }

        const alreadyMatches =
          options.reviewed
            ? before.reviewed_at !== null
            : before.reviewed_at === null;

        if (alreadyMatches) {
          return resultFromState({
            transactionId,
            changed: false,
            previousReviewedAt:
              before.reviewed_at,
            state: before
          });
        }

        const result = options.reviewed
          ? database
              .prepare(`
                UPDATE transactions
                SET reviewed_at = CURRENT_TIMESTAMP
                WHERE
                  id = ? AND
                  reviewed_at IS NULL
              `)
              .run(transactionId)
          : database
              .prepare(`
                UPDATE transactions
                SET reviewed_at = NULL
                WHERE
                  id = ? AND
                  reviewed_at IS NOT NULL
              `)
              .run(transactionId);

        if (result.changes !== 1) {
          throw new Error(
            "The transaction reviewed state was not updated."
          );
        }

        const after = readTransactionState(
          database,
          transactionId
        );

        if (!after) {
          throw new Error(
            "The updated Personal Finance transaction could not be read."
          );
        }

        if (
          after.classification !==
          before.classification
        ) {
          throw new Error(
            "Reviewing must not change transaction classification."
          );
        }

        if (
          after.review_status !==
          before.review_status
        ) {
          throw new Error(
            "Reviewing must not change transaction reconciliation status."
          );
        }

        if (
          after.transaction_link_count !==
          before.transaction_link_count
        ) {
          throw new Error(
            "Reviewing must not change transaction links."
          );
        }

        if (
          after.budget_allocation_count !==
          before.budget_allocation_count
        ) {
          throw new Error(
            "Reviewing must not change budget allocations."
          );
        }

        if (
          options.reviewed
            ? after.reviewed_at === null
            : after.reviewed_at !== null
        ) {
          throw new Error(
            "The transaction reviewed timestamp did not match the requested state."
          );
        }

        return resultFromState({
          transactionId,
          changed: true,
          previousReviewedAt:
            before.reviewed_at,
          state: after
        });
      });

    return updateTransaction.immediate();
  } finally {
    database.close();
  }
}
