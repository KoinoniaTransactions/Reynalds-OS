import {
  mkdtempSync,
  rmSync
} from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

vi.mock("server-only", () => ({}));

import {
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";
import {
  readPersonalFinanceTransactionMatching,
  updatePersonalFinanceTransferLink
} from "./personal-finance-transaction-matching-local";
import type {
  PersonalFinanceMonth
} from "./personal-finance-local";

const budget: PersonalFinanceMonth = {
  month: "July 2026",
  sourceFile: "test.csv",
  goal: 0,
  totals: {
    expensesBudgeted: 0,
    expensesPaid: 0,
    billsRemaining: 0,
    incomeExpected: 0,
    incomeReceived: 0,
    incomeRemaining: 0,
    totalBankBalance: 0,
    projectedEndingBalance: 0,
    totalCreditLimit: 0,
    totalCreditBalance: 0,
    totalMinimumPayments: 0,
    totalAvailableCredit: 0
  },
  bills: [
    {
      id: "shell-oil",
      name: "Shell Oil",
      budgeted: 50,
      paid: 0,
      remaining: 50,
      due: "07/10/2026",
      paymentMethod: "Card"
    },
    {
      id: "rent",
      name: "Rent",
      budgeted: 1000,
      paid: 0,
      remaining: 1000,
      due: "07/01/2026",
      paymentMethod: "ACH"
    }
  ],
  income: [
    {
      id: "paycheck",
      date: "07/15/2026",
      expected: 2500,
      received: 0
    }
  ],
  accounts: [],
  creditAccounts: [],
  irregularExpenses: [
    {
      id: "fuel",
      name: "Fuel",
      amount: 50,
      note: ""
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
    const insertAccount = database.prepare(`
      INSERT INTO accounts (
        id,
        source_key,
        institution,
        name,
        account_type
      )
      VALUES (?, ?, 'Test', ?, ?)
    `);

    insertAccount.run(
      "account_a",
      "account_a",
      "Checking A",
      "checking"
    );

    insertAccount.run(
      "account_b",
      "account_b",
      "Savings B",
      "savings"
    );

    const insertBatch = database.prepare(`
      INSERT INTO import_batches (
        id,
        account_id,
        importer_key,
        source_file_name,
        source_file_sha256,
        transaction_count
      )
      VALUES (?, ?, 'test', ?, ?, 10)
    `);

    insertBatch.run(
      "batch_a",
      "account_a",
      "a.csv",
      "sha_a"
    );

    insertBatch.run(
      "batch_b",
      "account_b",
      "b.csv",
      "sha_b"
    );

    const insertTransaction = database.prepare(`
      INSERT INTO transactions (
        id,
        account_id,
        import_batch_id,
        source_fingerprint,
        posted_date,
        original_description,
        display_description,
        amount_cents,
        classification,
        reviewed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTransaction.run(
      "transaction_expense",
      "account_a",
      "batch_a",
      "fingerprint_expense",
      "2026-07-10",
      "POS Debit Shell Oil",
      "Shell Oil",
      -5000,
      "expense",
      null
    );

    insertTransaction.run(
      "transaction_income",
      "account_a",
      "batch_a",
      "fingerprint_income",
      "2026-07-15",
      "Payroll Deposit",
      "Payroll Deposit",
      250000,
      "income",
      null
    );

    insertTransaction.run(
      "transaction_transfer_out",
      "account_a",
      "batch_a",
      "fingerprint_transfer_out",
      "2026-07-20",
      "Online Transfer",
      "Online Transfer",
      -100000,
      "transfer",
      "2026-07-21T10:00:00Z"
    );

    insertTransaction.run(
      "transaction_transfer_in",
      "account_b",
      "batch_b",
      "fingerprint_transfer_in",
      "2026-07-21",
      "Transfer Deposit",
      "Transfer Deposit",
      100000,
      "unknown",
      null
    );

    insertTransaction.run(
      "transaction_same_account",
      "account_a",
      "batch_a",
      "fingerprint_same_account",
      "2026-07-21",
      "Transfer Deposit",
      "Transfer Deposit",
      100000,
      "unknown",
      null
    );
  } finally {
    database.close();
  }
}

function readTransactionState(
  transactionId: string
) {
  const database = openPersonalFinanceDatabase({
    databasePath,
    readonly: true
  });

  try {
    return database.prepare(`
      SELECT
        classification,
        review_status,
        reviewed_at,
        (
          SELECT COUNT(*)
          FROM budget_allocations allocation
          WHERE allocation.transaction_id =
            transactions.id
        ) AS allocation_count
      FROM transactions
      WHERE id = ?
    `).get(transactionId) as {
      classification: string;
      review_status: string;
      reviewed_at: string | null;
      allocation_count: number;
    };
  } finally {
    database.close();
  }
}

beforeEach(() => {
  temporaryDirectory = mkdtempSync(
    path.join(
      os.tmpdir(),
      "personal-finance-matching-"
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

describe("personal finance matching", () => {
  it("ranks compatible expense and income targets without writing", async () => {
    const expense =
      await readPersonalFinanceTransactionMatching({
        transactionId: "transaction_expense",
        databasePath,
        budget
      });

    expect(
      expense.suggestions[0]?.targetKey
    ).toBe("bill:shell-oil");

    expect(
      expense.suggestions[0]?.confidenceLabel
    ).toBe("high");

    expect(
      expense.suggestions.every(
        (suggestion) =>
          suggestion.targetType !== "income"
      )
    ).toBe(true);

    const income =
      await readPersonalFinanceTransactionMatching({
        transactionId: "transaction_income",
        databasePath,
        budget
      });

    expect(
      income.suggestions[0]?.targetKey
    ).toBe("income:paycheck");

    expect(
      income.suggestions.every(
        (suggestion) =>
          suggestion.targetType === "income"
      )
    ).toBe(true);
  });

  it("finds only opposite amounts across different accounts", async () => {
    const state =
      await readPersonalFinanceTransactionMatching({
        transactionId:
          "transaction_transfer_out",
        databasePath,
        budget
      });

    expect(state.transferCandidates).toHaveLength(1);

    expect(
      state.transferCandidates[0]?.transactionId
    ).toBe("transaction_transfer_in");

    expect(
      state.transferCandidates[0]?.status
    ).toBe("suggested");

    expect(state.confirmedTransfer).toBeNull();
  });

  it("confirms and rejects a pair without changing transaction state", async () => {
    const sourceBefore =
      readTransactionState(
        "transaction_transfer_out"
      );

    const counterpartBefore =
      readTransactionState(
        "transaction_transfer_in"
      );

    const confirmed =
      await updatePersonalFinanceTransferLink({
        transactionId:
          "transaction_transfer_out",
        counterpartTransactionId:
          "transaction_transfer_in",
        status: "confirmed",
        databasePath
      });

    expect(
      confirmed.confirmedTransfer?.transactionId
    ).toBe("transaction_transfer_in");

    expect(
      readTransactionState(
        "transaction_transfer_out"
      )
    ).toEqual(sourceBefore);

    expect(
      readTransactionState(
        "transaction_transfer_in"
      )
    ).toEqual(counterpartBefore);

    const rejected =
      await updatePersonalFinanceTransferLink({
        transactionId:
          "transaction_transfer_out",
        counterpartTransactionId:
          "transaction_transfer_in",
        status: "rejected",
        databasePath
      });

    expect(rejected.confirmedTransfer).toBeNull();

    expect(
      rejected.transferCandidates[0]?.status
    ).toBe("rejected");
  });

  it("rejects invalid transfer pairs", async () => {
    await expect(
      updatePersonalFinanceTransferLink({
        transactionId:
          "transaction_transfer_out",
        counterpartTransactionId:
          "transaction_same_account",
        status: "confirmed",
        databasePath
      })
    ).rejects.toThrow(
      "different accounts"
    );

    await expect(
      updatePersonalFinanceTransferLink({
        transactionId:
          "transaction_expense",
        counterpartTransactionId:
          "transaction_transfer_in",
        status: "confirmed",
        databasePath
      })
    ).rejects.toThrow(
      "Only a transfer-classified"
    );
  });
});
