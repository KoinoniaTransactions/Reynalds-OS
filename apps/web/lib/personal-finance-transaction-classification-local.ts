import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import {
  getPersonalFinanceDatabasePath,
  openPersonalFinanceDatabase,
  type PersonalFinanceClassification,
  type PersonalFinanceReviewStatus,
} from "./personal-finance-db-local";

export const PERSONAL_FINANCE_CLASSIFICATIONS = [
  "unknown",
  "expense",
  "income",
  "refund",
  "transfer",
  "duplicate",
  "ignored",
] as const satisfies readonly PersonalFinanceClassification[];

export type UpdatePersonalFinanceTransactionClassificationOptions = {
  transactionId: string;
  classification: PersonalFinanceClassification;
  databasePath?: string;
};

export type PersonalFinanceTransactionClassificationUpdate = {
  transactionId: string;
  changed: boolean;
  previousClassification: PersonalFinanceClassification;
  classification: PersonalFinanceClassification;
  reviewStatus: PersonalFinanceReviewStatus;
  transactionLinkCount: number;
  budgetAllocationCount: number;
};

type TransactionStateRow = {
  id: string;
  classification: PersonalFinanceClassification;
  review_status: PersonalFinanceReviewStatus;
  transaction_link_count: number;
  budget_allocation_count: number;
};

export function isPersonalFinanceClassification(
  value: unknown,
): value is PersonalFinanceClassification {
  return (
    typeof value === "string" &&
    PERSONAL_FINANCE_CLASSIFICATIONS.includes(
      value as PersonalFinanceClassification,
    )
  );
}

function normalizedTransactionId(value: string): string {
  const transactionId = value.trim();

  if (!transactionId) {
    throw new Error(
      "A Personal Finance transaction ID is required.",
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
      "Local personal finance is disabled.",
    );
  }
}

function readTransactionState(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  transactionId: string,
): TransactionStateRow | undefined {
  return database
    .prepare(`
      SELECT
        t.id,
        t.classification,
        t.review_status,

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

export function updatePersonalFinanceTransactionClassification(
  options: UpdatePersonalFinanceTransactionClassificationOptions,
): PersonalFinanceTransactionClassificationUpdate {
  assertLocalPersonalFinanceEnabled();

  const transactionId = normalizedTransactionId(
    options.transactionId,
  );

  if (
    !isPersonalFinanceClassification(
      options.classification,
    )
  ) {
    throw new Error(
      `Unsupported Personal Finance classification: ${String(
        options.classification,
      )}`,
    );
  }

  const databasePath = path.resolve(
    options.databasePath ??
      getPersonalFinanceDatabasePath(),
  );

  if (!existsSync(databasePath)) {
    throw new Error(
      "The private Personal Finance database was not found.",
    );
  }

  const database = openPersonalFinanceDatabase({
    databasePath,
  });

  try {
    const updateTransaction =
      database.transaction(() => {
        const before = readTransactionState(
          database,
          transactionId,
        );

        if (!before) {
          throw new Error(
            "The Personal Finance transaction was not found.",
          );
        }

        if (
          before.classification ===
          options.classification
        ) {
          return {
            transactionId,
            changed: false,
            previousClassification:
              before.classification,
            classification:
              before.classification,
            reviewStatus: before.review_status,
            transactionLinkCount:
              before.transaction_link_count,
            budgetAllocationCount:
              before.budget_allocation_count,
          };
        }

        const result = database
          .prepare(`
            UPDATE transactions
            SET
              classification = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .run(
            options.classification,
            transactionId,
          );

        if (result.changes !== 1) {
          throw new Error(
            "The transaction classification was not updated.",
          );
        }

        const after = readTransactionState(
          database,
          transactionId,
        );

        if (!after) {
          throw new Error(
            "The updated Personal Finance transaction could not be read.",
          );
        }

        if (
          after.review_status !==
          before.review_status
        ) {
          throw new Error(
            "Classification must not change transaction review status.",
          );
        }

        if (
          after.transaction_link_count !==
          before.transaction_link_count
        ) {
          throw new Error(
            "Classification must not change transaction links.",
          );
        }

        if (
          after.budget_allocation_count !==
          before.budget_allocation_count
        ) {
          throw new Error(
            "Classification must not change budget allocations.",
          );
        }

        return {
          transactionId,
          changed: true,
          previousClassification:
            before.classification,
          classification: after.classification,
          reviewStatus: after.review_status,
          transactionLinkCount:
            after.transaction_link_count,
          budgetAllocationCount:
            after.budget_allocation_count,
        };
      });

    return updateTransaction.immediate();
  } finally {
    database.close();
  }
}
