import "server-only";

import {
  readFile
} from "node:fs/promises";

import path from "node:path";

import {
  getPersonalFinanceDatabasePath
} from "./personal-finance-db-local";

import type {
  PersonalFinanceMonth
} from "./personal-finance-local";

export type PersonalFinanceBootstrapMode =
  | "legacy_csv"
  | "demo"
  | "clean";

type PersonalFinanceBootstrapControl = {
  version: 1;

  mode:
    PersonalFinanceBootstrapMode;

  updatedAt?: string;
  purpose?: string;
};

export function getPersonalFinanceBootstrapControlPath():
  string {
  const configuredPath =
    process.env
      .PERSONAL_FINANCE_BOOTSTRAP_MODE_PATH
      ?.trim();

  if (configuredPath) {
    return path.resolve(
      configuredPath
    );
  }

  return path.join(
    path.dirname(
      getPersonalFinanceDatabasePath()
    ),
    "bootstrap-mode.json"
  );
}

export async function readPersonalFinanceBootstrapMode():
  Promise<
    PersonalFinanceBootstrapMode
  > {
  const controlPath =
    getPersonalFinanceBootstrapControlPath();

  let contents: string;

  try {
    contents =
      await readFile(
        controlPath,
        "utf8"
      );
  } catch (error) {
    if (
      getErrorCode(error) ===
      "ENOENT"
    ) {
      /*
       * Backward compatibility:
       *
       * Existing developer workspaces
       * predate bootstrap-mode.json and
       * historically loaded the private
       * CSV automatically.
       */
      return "legacy_csv";
    }

    throw error;
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(
        contents
      );
  } catch {
    throw new Error(
      "Personal Finance bootstrap-mode.json is not valid JSON."
    );
  }

  if (
    typeof parsed !==
      "object" ||
    parsed === null
  ) {
    throw new Error(
      "Personal Finance bootstrap-mode.json must contain an object."
    );
  }

  const control =
    parsed as
      Partial<
        PersonalFinanceBootstrapControl
      >;

  if (
    control.version !== 1
  ) {
    throw new Error(
      "Personal Finance bootstrap control version is not supported."
    );
  }

  if (
    control.mode !==
      "legacy_csv" &&
    control.mode !==
      "demo" &&
    control.mode !==
      "clean"
  ) {
    throw new Error(
      "Personal Finance bootstrap mode must be legacy_csv, demo, or clean."
    );
  }

  return control.mode;
}

export function createPersonalFinanceDemoBudget():
  PersonalFinanceMonth {
  const bills =
    [
      {
        id:
          "demo-bill-mortgage",

        name:
          "Demo Home Mortgage",

        budgeted:
          2400,

        paid:
          0,

        remaining:
          2400,

        due:
          "1/1/2030",

        paymentMethod:
          "Demo autopay"
      },

      {
        id:
          "demo-bill-electric",

        name:
          "Demo Electric",

        budgeted:
          140,

        paid:
          0,

        remaining:
          140,

        due:
          "1/5/2030",

        paymentMethod:
          "Demo checking"
      },

      {
        id:
          "demo-bill-internet",

        name:
          "Demo Internet",

        budgeted:
          85,

        paid:
          0,

        remaining:
          85,

        due:
          "1/8/2030",

        paymentMethod:
          "Demo checking"
      },

      {
        id:
          "demo-bill-auto",

        name:
          "Demo Auto Loan",

        budgeted:
          525,

        paid:
          0,

        remaining:
          525,

        due:
          "1/15/2030",

        paymentMethod:
          "Demo autopay"
      },

      {
        id:
          "demo-bill-insurance",

        name:
          "Demo Insurance",

        budgeted:
          210,

        paid:
          0,

        remaining:
          210,

        due:
          "1/20/2030",

        paymentMethod:
          "Demo checking"
      }
    ];

  const expensesBudgeted =
    bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        bill.budgeted,
      0
    );

  const expensesPaid =
    bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        bill.paid,
      0
    );

  const billsRemaining =
    bills.reduce(
      (
        total,
        bill
      ) =>
        total +
        bill.remaining,
      0
    );

  const income = [
    {
      id:
        "demo-income-1",

      date:
        "1/4/2030",

      expected:
        3200,

      received:
        0
    },

    {
      id:
        "demo-income-2",

      date:
        "1/18/2030",

      expected:
        3200,

      received:
        0
    }
  ];

  const incomeExpected =
    income.reduce(
      (
        total,
        entry
      ) =>
        total +
        entry.expected,
      0
    );

  const incomeReceived =
    income.reduce(
      (
        total,
        entry
      ) =>
        total +
        entry.received,
      0
    );

  const accounts = [
    {
      id:
        "demo-checking",

      name:
        "Demo Checking",

      amount:
        8000
    },

    {
      id:
        "demo-savings",

      name:
        "Demo Savings",

      amount:
        12000
    }
  ];

  const totalBankBalance =
    accounts.reduce(
      (
        total,
        account
      ) =>
        total +
        account.amount,
      0
    );

  const creditAccounts = [
    {
      id:
        "demo-credit-1",

      name:
        "Demo Credit Card",

      limit:
        15000,

      balance:
        1200,

      minimumPayment:
        45,

      available:
        13800
    }
  ];

  const totalCreditLimit =
    creditAccounts.reduce(
      (
        total,
        account
      ) =>
        total +
        account.limit,
      0
    );

  const totalCreditBalance =
    creditAccounts.reduce(
      (
        total,
        account
      ) =>
        total +
        account.balance,
      0
    );

  const totalMinimumPayments =
    creditAccounts.reduce(
      (
        total,
        account
      ) =>
        total +
        account.minimumPayment,
      0
    );

  const totalAvailableCredit =
    creditAccounts.reduce(
      (
        total,
        account
      ) =>
        total +
        account.available,
      0
    );

  return {
    month:
      "January 2030",

    sourceFile:
      "synthetic-demo-data",

    goal:
      5000,

    totals: {
      expensesBudgeted,
      expensesPaid,
      billsRemaining,

      incomeExpected,
      incomeReceived,

      incomeRemaining:
        incomeExpected -
        incomeReceived,

      totalBankBalance,

      projectedEndingBalance:
        totalBankBalance +
        incomeExpected -
        billsRemaining,

      totalCreditLimit,
      totalCreditBalance,
      totalMinimumPayments,
      totalAvailableCredit
    },

    bills,
    income,
    accounts,
    creditAccounts,

    irregularExpenses: []
  };
}

function getErrorCode(
  error: unknown
): string | null {
  if (
    typeof error ===
      "object" &&
    error !== null &&
    "code" in error
  ) {
    const code =
      (
        error as {
          code?: unknown;
        }
      ).code;

    return typeof code ===
      "string"
      ? code
      : null;
  }

  return null;
}
