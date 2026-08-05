import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import {
  createPersonalFinanceId,
  getPersonalFinanceDatabasePath,
  openPersonalFinanceDatabase,
  type PersonalFinanceClassification,
  type PersonalFinanceReviewStatus
} from "./personal-finance-db-local";
import {
  loadLocalPersonalFinance,
  type PersonalFinanceMonth
} from "./personal-finance-local";

export type PersonalFinanceReconciliationTargetType =
  | "bill"
  | "income"
  | "category";

export type PersonalFinanceReconciliationTarget = {
  key: string;
  label: string;
  type: PersonalFinanceReconciliationTargetType;
};

export type PersonalFinanceReconciliationCatalog = {
  budgetMonth: string;
  targets: PersonalFinanceReconciliationTarget[];
};

export type PersonalFinanceReconciliationAllocationInput = {
  targetKey: string;
  amountCents: number;
  note?: string | null;
};

export type PersonalFinanceReconciliationAllocation = {
  id: string;
  targetKey: string;
  targetLabel: string;
  amountCents: number;
  note: string | null;
};

export type PersonalFinanceTransactionReconciliationState = {
  transactionId: string;
  classification: PersonalFinanceClassification;
  reviewStatus: PersonalFinanceReviewStatus;
  reviewedAt: string | null;
  amountCents: number;
  budgetMonth: string | null;
  allocations: PersonalFinanceReconciliationAllocation[];
  targets: PersonalFinanceReconciliationTarget[];
};

export type UpdatePersonalFinanceTransactionReconciliationOptions = {
  transactionId: string;
  reconciled: boolean;
  allocations?: PersonalFinanceReconciliationAllocationInput[];
  databasePath?: string;
  catalog?: PersonalFinanceReconciliationCatalog;
};

export type PersonalFinanceTransactionReconciliationUpdate =
  PersonalFinanceTransactionReconciliationState & {
    changed: boolean;
    previousReviewStatus: PersonalFinanceReviewStatus;
  };

type TransactionRow = {
  id: string;
  classification: PersonalFinanceClassification;
  review_status: PersonalFinanceReviewStatus;
  reviewed_at: string | null;
  amount_cents: number;
};

type AllocationRow = {
  id: string;
  budget_month: string;
  budget_item_key: string;
  budget_item_label: string;
  amount_cents: number;
  note: string | null;
};

const MAX_ALLOCATIONS = 12;
const MAX_NOTE_LENGTH = 500;

function normalizedTransactionId(value: string): string {
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

function transactionNeedsAllocations(
  classification: PersonalFinanceClassification
): boolean {
  return (
    classification === "expense" ||
    classification === "income" ||
    classification === "refund"
  );
}

function targetTypesForClassification(
  classification: PersonalFinanceClassification
): readonly PersonalFinanceReconciliationTargetType[] {
  if (classification === "income") {
    return ["income"];
  }

  if (
    classification === "expense" ||
    classification === "refund"
  ) {
    return ["bill", "category"];
  }

  return [];
}

function catalogFromBudget(
  budget: PersonalFinanceMonth
): PersonalFinanceReconciliationCatalog {
  const targets: PersonalFinanceReconciliationTarget[] = [
    ...budget.bills.map((bill) => ({
      key: `bill:${bill.id}`,
      label: bill.name,
      type: "bill" as const
    })),
    ...budget.income.map((entry) => ({
      key: `income:${entry.id}`,
      label: `Income ${entry.date}`,
      type: "income" as const
    })),
    ...budget.irregularExpenses.map((expense) => ({
      key: `category:${expense.id}`,
      label: expense.name,
      type: "category" as const
    }))
  ];

  return {
    budgetMonth: budget.month,
    targets
  };
}

export async function loadPersonalFinanceReconciliationCatalog(): Promise<PersonalFinanceReconciliationCatalog> {
  const result = await loadLocalPersonalFinance();

  if (!result.budget) {
    throw new Error(
      result.reason ??
        "The Personal Finance budget is unavailable."
    );
  }

  return catalogFromBudget(result.budget);
}

function readTransaction(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  transactionId: string
): TransactionRow | undefined {
  return database
    .prepare(`
      SELECT
        id,
        classification,
        review_status,
        reviewed_at,
        amount_cents
      FROM transactions
      WHERE id = ?
    `)
    .get(transactionId) as
    | TransactionRow
    | undefined;
}

function readAllocations(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  transactionId: string
): AllocationRow[] {
  return database
    .prepare(`
      SELECT
        id,
        budget_month,
        budget_item_key,
        budget_item_label,
        amount_cents,
        note
      FROM budget_allocations
      WHERE transaction_id = ?
      ORDER BY budget_item_label, id
    `)
    .all(transactionId) as AllocationRow[];
}

function allocationFromRow(
  row: AllocationRow
): PersonalFinanceReconciliationAllocation {
  return {
    id: row.id,
    targetKey: row.budget_item_key,
    targetLabel: row.budget_item_label,
    amountCents: row.amount_cents,
    note: row.note
  };
}

function stateFromRows({
  transaction,
  allocations,
  catalog
}: {
  transaction: TransactionRow;
  allocations: AllocationRow[];
  catalog: PersonalFinanceReconciliationCatalog | null;
}): PersonalFinanceTransactionReconciliationState {
  return {
    transactionId: transaction.id,
    classification: transaction.classification,
    reviewStatus: transaction.review_status,
    reviewedAt: transaction.reviewed_at,
    amountCents: transaction.amount_cents,
    budgetMonth:
      allocations[0]?.budget_month ??
      catalog?.budgetMonth ??
      null,
    allocations: allocations.map(allocationFromRow),
    targets:
      catalog?.targets.filter((target) =>
        targetTypesForClassification(
          transaction.classification
        ).includes(target.type)
      ) ?? []
  };
}

function normalizeNote(
  value: string | null | undefined
): string | null {
  const note = value?.trim() ?? "";

  if (note.length > MAX_NOTE_LENGTH) {
    throw new Error(
      `Allocation notes must be ${MAX_NOTE_LENGTH} characters or fewer.`
    );
  }

  return note || null;
}

function normalizeAllocations({
  transaction,
  allocations,
  catalog
}: {
  transaction: TransactionRow;
  allocations: PersonalFinanceReconciliationAllocationInput[];
  catalog: PersonalFinanceReconciliationCatalog | null;
}): Array<{
  targetKey: string;
  targetLabel: string;
  amountCents: number;
  note: string | null;
}> {
  if (transaction.classification === "unknown") {
    throw new Error(
      "Classify the transaction before reconciling it."
    );
  }

  if (!transactionNeedsAllocations(transaction.classification)) {
    if (allocations.length > 0) {
      throw new Error(
        "Transfers, duplicates, and ignored transactions cannot have budget allocations."
      );
    }

    return [];
  }

  if (!catalog) {
    throw new Error(
      "The Personal Finance budget is unavailable."
    );
  }

  if (
    allocations.length < 1 ||
    allocations.length > MAX_ALLOCATIONS
  ) {
    throw new Error(
      `Reconciliation requires between 1 and ${MAX_ALLOCATIONS} allocations.`
    );
  }

  const allowedTypes = new Set(
    targetTypesForClassification(
      transaction.classification
    )
  );

  const targetsByKey = new Map(
    catalog.targets.map((target) => [
      target.key,
      target
    ])
  );

  const seenTargetKeys = new Set<string>();

  const normalized = allocations.map(
    (allocation) => {
      const targetKey = allocation.targetKey.trim();

      if (!targetKey) {
        throw new Error(
          "Every allocation requires a budget target."
        );
      }

      if (seenTargetKeys.has(targetKey)) {
        throw new Error(
          "A budget target may only appear once in a split reconciliation."
        );
      }

      seenTargetKeys.add(targetKey);

      const target = targetsByKey.get(targetKey);

      if (!target || !allowedTypes.has(target.type)) {
        throw new Error(
          "The selected budget target is not valid for this transaction classification."
        );
      }

      if (
        !Number.isInteger(allocation.amountCents) ||
        allocation.amountCents === 0
      ) {
        throw new Error(
          "Every allocation requires a non-zero whole-cent amount."
        );
      }

      if (
        Math.sign(allocation.amountCents) !==
        Math.sign(transaction.amount_cents)
      ) {
        throw new Error(
          "Allocation directions must match the transaction direction."
        );
      }

      return {
        targetKey,
        targetLabel: target.label,
        amountCents: allocation.amountCents,
        note: normalizeNote(allocation.note)
      };
    }
  );

  const allocatedTotal = normalized.reduce(
    (total, allocation) =>
      total + allocation.amountCents,
    0
  );

  if (allocatedTotal !== transaction.amount_cents) {
    throw new Error(
      "Split allocations must equal the full transaction amount."
    );
  }

  return normalized;
}

function equalAllocations(
  existing: AllocationRow[],
  requested: Array<{
    targetKey: string;
    targetLabel: string;
    amountCents: number;
    note: string | null;
  }>,
  budgetMonth: string | null
): boolean {
  if (existing.length !== requested.length) {
    return false;
  }

  const left = existing
    .map((allocation) => ({
      budgetMonth: allocation.budget_month,
      targetKey: allocation.budget_item_key,
      targetLabel: allocation.budget_item_label,
      amountCents: allocation.amount_cents,
      note: allocation.note
    }))
    .sort((a, b) =>
      a.targetKey.localeCompare(b.targetKey)
    );

  const right = requested
    .map((allocation) => ({
      budgetMonth,
      ...allocation
    }))
    .sort((a, b) =>
      a.targetKey.localeCompare(b.targetKey)
    );

  return JSON.stringify(left) === JSON.stringify(right);
}

async function catalogForTransaction(
  classification: PersonalFinanceClassification,
  providedCatalog:
    | PersonalFinanceReconciliationCatalog
    | undefined
): Promise<PersonalFinanceReconciliationCatalog | null> {
  if (!transactionNeedsAllocations(classification)) {
    return null;
  }

  return (
    providedCatalog ??
    (await loadPersonalFinanceReconciliationCatalog())
  );
}

export async function readPersonalFinanceTransactionReconciliation({
  transactionId: rawTransactionId,
  databasePath: configuredDatabasePath,
  catalog: providedCatalog
}: {
  transactionId: string;
  databasePath?: string;
  catalog?: PersonalFinanceReconciliationCatalog;
}): Promise<PersonalFinanceTransactionReconciliationState> {
  assertLocalPersonalFinanceEnabled();

  const transactionId = normalizedTransactionId(
    rawTransactionId
  );

  const databasePath = path.resolve(
    configuredDatabasePath ??
      getPersonalFinanceDatabasePath()
  );

  if (!existsSync(databasePath)) {
    throw new Error(
      "The private Personal Finance database was not found."
    );
  }

  const database = openPersonalFinanceDatabase({
    databasePath,
    readonly: true
  });

  try {
    const transaction = readTransaction(
      database,
      transactionId
    );

    if (!transaction) {
      throw new Error(
        "The Personal Finance transaction was not found."
      );
    }

    const catalog = await catalogForTransaction(
      transaction.classification,
      providedCatalog
    );

    return stateFromRows({
      transaction,
      allocations: readAllocations(
        database,
        transactionId
      ),
      catalog
    });
  } finally {
    database.close();
  }
}

export async function updatePersonalFinanceTransactionReconciliation(
  options: UpdatePersonalFinanceTransactionReconciliationOptions
): Promise<PersonalFinanceTransactionReconciliationUpdate> {
  assertLocalPersonalFinanceEnabled();

  const transactionId = normalizedTransactionId(
    options.transactionId
  );

  if (typeof options.reconciled !== "boolean") {
    throw new Error(
      "A Personal Finance reconciliation state is required."
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
    const transaction = readTransaction(
      database,
      transactionId
    );

    if (!transaction) {
      throw new Error(
        "The Personal Finance transaction was not found."
      );
    }

    const catalog = options.reconciled
      ? await catalogForTransaction(
          transaction.classification,
          options.catalog
        )
      : null;

    const requestedAllocations =
      options.reconciled
        ? normalizeAllocations({
            transaction,
            allocations:
              options.allocations ?? [],
            catalog
          })
        : [];

    const existingAllocations = readAllocations(
      database,
      transactionId
    );

    const nextBudgetMonth =
      requestedAllocations.length > 0
        ? catalog?.budgetMonth ?? null
        : null;

    const alreadyMatches =
      transaction.review_status ===
        (options.reconciled
          ? "reconciled"
          : "unreviewed") &&
      equalAllocations(
        existingAllocations,
        requestedAllocations,
        nextBudgetMonth
      );

    if (alreadyMatches) {
      return {
        ...stateFromRows({
          transaction,
          allocations: existingAllocations,
          catalog
        }),
        changed: false,
        previousReviewStatus:
          transaction.review_status
      };
    }

    const applyReconciliation =
      database.transaction(() => {
        database
          .prepare(`
            DELETE FROM budget_allocations
            WHERE transaction_id = ?
          `)
          .run(transactionId);

        if (options.reconciled) {
          const insertAllocation = database.prepare(`
            INSERT INTO budget_allocations (
              id,
              transaction_id,
              budget_month,
              budget_item_key,
              budget_item_label,
              amount_cents,
              note
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          for (const allocation of requestedAllocations) {
            insertAllocation.run(
              createPersonalFinanceId(
                "allocation",
                [
                  transactionId,
                  catalog?.budgetMonth,
                  allocation.targetKey
                ]
              ),
              transactionId,
              catalog?.budgetMonth,
              allocation.targetKey,
              allocation.targetLabel,
              allocation.amountCents,
              allocation.note
            );
          }
        }

        const result = database
          .prepare(`
            UPDATE transactions
            SET
              review_status = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .run(
            options.reconciled
              ? "reconciled"
              : "unreviewed",
            transactionId
          );

        if (result.changes !== 1) {
          throw new Error(
            "The transaction reconciliation state was not updated."
          );
        }
      });

    applyReconciliation.immediate();

    const afterTransaction = readTransaction(
      database,
      transactionId
    );

    if (!afterTransaction) {
      throw new Error(
        "The updated Personal Finance transaction could not be read."
      );
    }

    if (
      afterTransaction.classification !==
      transaction.classification
    ) {
      throw new Error(
        "Reconciling must not change transaction classification."
      );
    }

    if (
      afterTransaction.reviewed_at !==
      transaction.reviewed_at
    ) {
      throw new Error(
        "Reconciling must not change the reviewed timestamp."
      );
    }

    const afterAllocations = readAllocations(
      database,
      transactionId
    );

    return {
      ...stateFromRows({
        transaction: afterTransaction,
        allocations: afterAllocations,
        catalog
      }),
      changed: true,
      previousReviewStatus:
        transaction.review_status
    };
  } finally {
    database.close();
  }
}
