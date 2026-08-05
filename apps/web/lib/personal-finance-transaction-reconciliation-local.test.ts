import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";
import {
  readPersonalFinanceTransactionReconciliation,
  updatePersonalFinanceTransactionReconciliation,
  type PersonalFinanceReconciliationCatalog
} from "./personal-finance-transaction-reconciliation-local";
import {
  updatePersonalFinanceTransactionClassification
} from "./personal-finance-transaction-classification-local";

const catalog: PersonalFinanceReconciliationCatalog = {
  budgetMonth: "July 2026",
  targets: [
    {
      key: "bill:home",
      label: "Home",
      type: "bill"
    },
    {
      key: "bill:utilities",
      label: "Utilities",
      type: "bill"
    },
    {
      key: "income:paycheck",
      label: "Income 07/15/2026",
      type: "income"
    },
    {
      key: "category:household",
      label: "Household",
      type: "category"
    }
  ]
};

let temporaryDirectory = "";
let databasePath = "";

function createFixtureDatabase() {
  const database = openPersonalFinanceDatabase({
    databasePath
  });

  try {
    database.prepare(`
      INSERT INTO accounts (
        id,
        source_key,
        institution,
        name,
        account_type
      )
      VALUES (
        'account_test',
        'account_test',
        'Test Institution',
        'Test Checking',
        'checking'
      )
    `).run();

    database.prepare(`
      INSERT INTO import_batches (
        id,
        account_id,
        importer_key,
        source_file_name,
        source_file_sha256,
        transaction_count
      )
      VALUES (
        'batch_test',
        'account_test',
        'test',
        'test.csv',
        'test_sha',
        5
      )
    `).run();

    const insertTransaction = database.prepare(`
      INSERT INTO transactions (
        id,
        account_id,
        import_batch_id,
        source_fingerprint,
        posted_date,
        original_description,
        amount_cents,
        classification
      )
      VALUES (
        ?,
        'account_test',
        'batch_test',
        ?,
        '2026-07-15',
        ?,
        ?,
        ?
      )
    `);

    insertTransaction.run(
      "transaction_expense",
      "fingerprint_expense",
      "Expense",
      -12000,
      "expense"
    );

    insertTransaction.run(
      "transaction_income",
      "fingerprint_income",
      "Income",
      25000,
      "income"
    );

    insertTransaction.run(
      "transaction_refund",
      "fingerprint_refund",
      "Refund",
      4000,
      "refund"
    );

    insertTransaction.run(
      "transaction_transfer",
      "fingerprint_transfer",
      "Transfer",
      -10000,
      "transfer"
    );

    insertTransaction.run(
      "transaction_unknown",
      "fingerprint_unknown",
      "Unknown",
      -5000,
      "unknown"
    );
  } finally {
    database.close();
  }
}

function readRawState(transactionId: string) {
  const database = openPersonalFinanceDatabase({
    databasePath,
    readonly: true
  });

  try {
    return database.prepare(`
      SELECT
        t.classification,
        t.review_status,
        t.reviewed_at,
        (
          SELECT COUNT(*)
          FROM budget_allocations allocation
          WHERE allocation.transaction_id = t.id
        ) AS allocation_count,
        COALESCE(
          (
            SELECT SUM(allocation.amount_cents)
            FROM budget_allocations allocation
            WHERE allocation.transaction_id = t.id
          ),
          0
        ) AS allocation_total
      FROM transactions t
      WHERE t.id = ?
    `).get(transactionId) as {
      classification: string;
      review_status: string;
      reviewed_at: string | null;
      allocation_count: number;
      allocation_total: number;
    };
  } finally {
    database.close();
  }
}

beforeEach(() => {
  temporaryDirectory = mkdtempSync(
    path.join(
      os.tmpdir(),
      "personal-finance-reconciliation-"
    )
  );

  databasePath = path.join(
    temporaryDirectory,
    "test.sqlite3"
  );

  process.env.ENABLE_LOCAL_PERSONAL_FINANCE =
    "true";

  createFixtureDatabase();
});

afterEach(() => {
  delete process.env.ENABLE_LOCAL_PERSONAL_FINANCE;

  rmSync(temporaryDirectory, {
    recursive: true,
    force: true
  });
});

describe("personal finance reconciliation", () => {
  it("reconciles an expense with exact split allocations and preserves reviewed state", async () => {
    const result =
      await updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_expense",
        reconciled: true,
        databasePath,
        catalog,
        allocations: [
          {
            targetKey: "bill:home",
            amountCents: -7000
          },
          {
            targetKey: "category:household",
            amountCents: -5000,
            note: "Shared household cost"
          }
        ]
      });

    expect(result.changed).toBe(true);
    expect(result.reviewStatus).toBe("reconciled");
    expect(result.reviewedAt).toBeNull();
    expect(result.allocations).toHaveLength(2);

    const raw = readRawState(
      "transaction_expense"
    );

    expect(raw.classification).toBe("expense");
    expect(raw.review_status).toBe("reconciled");
    expect(raw.reviewed_at).toBeNull();
    expect(raw.allocation_count).toBe(2);
    expect(raw.allocation_total).toBe(-12000);
  });

  it("treats an identical reconciliation as a no-op and safely unreconciles", async () => {
    const options = {
      transactionId: "transaction_expense",
      reconciled: true as const,
      databasePath,
      catalog,
      allocations: [
        {
          targetKey: "bill:home",
          amountCents: -12000
        }
      ]
    };

    await updatePersonalFinanceTransactionReconciliation(
      options
    );

    const repeated =
      await updatePersonalFinanceTransactionReconciliation(
        options
      );

    expect(repeated.changed).toBe(false);

    const undone =
      await updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_expense",
        reconciled: false,
        databasePath
      });

    expect(undone.changed).toBe(true);
    expect(undone.reviewStatus).toBe("unreviewed");
    expect(undone.allocations).toEqual([]);

    const raw = readRawState(
      "transaction_expense"
    );

    expect(raw.review_status).toBe("unreviewed");
    expect(raw.allocation_count).toBe(0);
    expect(raw.allocation_total).toBe(0);
  });

  it("reconciles transfer-like classifications without budget allocations", async () => {
    const result =
      await updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_transfer",
        reconciled: true,
        databasePath,
        allocations: []
      });

    expect(result.reviewStatus).toBe("reconciled");
    expect(result.allocations).toEqual([]);

    await expect(
      updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_transfer",
        reconciled: true,
        databasePath,
        allocations: [
          {
            targetKey: "bill:home",
            amountCents: -10000
          }
        ]
      })
    ).rejects.toThrow(
      "cannot have budget allocations"
    );
  });

  it("rejects unknown, mismatched, duplicate, and incompatible allocations", async () => {
    await expect(
      updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_unknown",
        reconciled: true,
        databasePath,
        catalog,
        allocations: []
      })
    ).rejects.toThrow(
      "Classify the transaction"
    );

    await expect(
      updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_expense",
        reconciled: true,
        databasePath,
        catalog,
        allocations: [
          {
            targetKey: "bill:home",
            amountCents: -11000
          }
        ]
      })
    ).rejects.toThrow(
      "equal the full transaction amount"
    );

    await expect(
      updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_expense",
        reconciled: true,
        databasePath,
        catalog,
        allocations: [
          {
            targetKey: "bill:home",
            amountCents: -6000
          },
          {
            targetKey: "bill:home",
            amountCents: -6000
          }
        ]
      })
    ).rejects.toThrow(
      "may only appear once"
    );

    await expect(
      updatePersonalFinanceTransactionReconciliation({
        transactionId: "transaction_income",
        reconciled: true,
        databasePath,
        catalog,
        allocations: [
          {
            targetKey: "bill:home",
            amountCents: 25000
          }
        ]
      })
    ).rejects.toThrow(
      "not valid for this transaction classification"
    );
  });

  it("blocks classification changes while a transaction is reconciled", async () => {
    await updatePersonalFinanceTransactionReconciliation({
      transactionId: "transaction_expense",
      reconciled: true,
      databasePath,
      catalog,
      allocations: [
        {
          targetKey: "bill:home",
          amountCents: -12000
        }
      ]
    });

    expect(() =>
      updatePersonalFinanceTransactionClassification({
        transactionId: "transaction_expense",
        classification: "income",
        databasePath
      })
    ).toThrow(
      "Unreconcile the transaction before changing its classification."
    );
  });

  it("reads available targets and existing allocations without writing", async () => {
    await updatePersonalFinanceTransactionReconciliation({
      transactionId: "transaction_refund",
      reconciled: true,
      databasePath,
      catalog,
      allocations: [
        {
          targetKey: "category:household",
          amountCents: 4000
        }
      ]
    });

    const state =
      await readPersonalFinanceTransactionReconciliation({
        transactionId: "transaction_refund",
        databasePath,
        catalog
      });

    expect(state.reviewStatus).toBe("reconciled");
    expect(state.budgetMonth).toBe("July 2026");
    expect(state.allocations).toHaveLength(1);
    expect(
      state.targets.some(
        (target) =>
          target.key === "category:household"
      )
    ).toBe(true);
    expect(
      state.targets.every(
        (target) =>
          target.type === "bill" ||
          target.type === "category"
      )
    ).toBe(true);
    expect(
      state.targets.some(
        (target) => target.type === "income"
      )
    ).toBe(false);
  });

  it("returns only income targets for income transactions", async () => {
    const state =
      await readPersonalFinanceTransactionReconciliation({
        transactionId: "transaction_income",
        databasePath,
        catalog
      });

    expect(state.targets).toHaveLength(1);
    expect(state.targets[0]?.type).toBe("income");
    expect(state.targets[0]?.key).toBe(
      "income:paycheck"
    );
  });
});
