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

vi.mock(
  "server-only",
  () => ({})
);

import type {
  PersonalFinanceMonth
} from "./personal-finance-local";

import {
  createNextPersonalFinancePeriod,
  preparePersonalFinancePeriodWorkspace,
  readPersonalFinancePeriodBudget
} from "./personal-finance-period-local";

import {
  closePersonalFinanceAccountBalance,
  readPersonalFinanceReconciliationWorkspace,
  recordPersonalFinanceBillPayment,
  updatePersonalFinanceAccountCurrentBalance
} from "./personal-finance-reconciliation-local";

let temporaryDirectory = "";
let databasePath = "";

function legacyBudget():
  PersonalFinanceMonth {
  return {
    month:
      "July 2026",

    sourceFile:
      "JM_Budget_July_2026.csv",

    goal:
      500,

    totals: {
      expensesBudgeted:
        100,

      expensesPaid:
        20,

      billsRemaining:
        80,

      incomeExpected:
        0,

      incomeReceived:
        0,

      incomeRemaining:
        0,

      totalBankBalance:
        1000,

      projectedEndingBalance:
        920,

      totalCreditLimit:
        0,

      totalCreditBalance:
        0,

      totalMinimumPayments:
        0,

      totalAvailableCredit:
        0
    },

    bills: [
      {
        id:
          "electric",

        name:
          "Electric",

        budgeted:
          100,

        paid:
          20,

        remaining:
          80,

        due:
          "7/5/2026",

        paymentMethod:
          "Autopay"
      }
    ],

    income: [],

    accounts: [
      {
        id:
          "checking",

        name:
          "Checking",

        amount:
          1000
      }
    ],

    creditAccounts: [],

    irregularExpenses: []
  };
}

beforeEach(() => {
  temporaryDirectory =
    mkdtempSync(
      path.join(
        os.tmpdir(),
        "personal-finance-reconciliation-"
      )
    );

  databasePath =
    path.join(
      temporaryDirectory,
      "test.sqlite3"
    );

  process.env
    .ENABLE_LOCAL_PERSONAL_FINANCE =
    "true";

  process.env
    .PERSONAL_FINANCE_DB_PATH =
    databasePath;
});

afterEach(() => {
  delete process.env
    .ENABLE_LOCAL_PERSONAL_FINANCE;

  delete process.env
    .PERSONAL_FINANCE_DB_PATH;

  rmSync(
    temporaryDirectory,
    {
      recursive: true,
      force: true
    }
  );
});

describe(
  "personal finance monthly reconciliation",
  () => {
    it(
      "reconciles cash, records a bill payment, and carries the closing balance forward",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),

          requestedPeriodKey:
            "2026-07"
        });

        const initial =
          readPersonalFinanceReconciliationWorkspace(
            "2026-07"
          );

        expect(
          initial.accounts[0]
            ?.openingBalance
        ).toBe(
          1000
        );

        expect(
          initial.accounts[0]
            ?.currentBalance
        ).toBe(
          1000
        );

        expect(
          initial.accounts[0]
            ?.closingBalance
        ).toBeNull();

        const current =
          updatePersonalFinanceAccountCurrentBalance(
            "2026-07",
            {
              accountKey:
                "checking",

              balance:
                900
            }
          );

        expect(
          current.accounts[0]
            ?.currentBalance
        ).toBe(
          900
        );

        const paid =
          recordPersonalFinanceBillPayment(
            "2026-07",
            {
              budgetItemKey:
                "electric",

              amount:
                30,

              paidOn:
                "2026-07-05",

              note:
                "Monthly electric payment"
            }
          );

        expect(
          paid.bills[0]
            ?.paid
        ).toBe(
          50
        );

        expect(
          paid.bills[0]
            ?.remaining
        ).toBe(
          50
        );

        expect(
          paid.bills[0]
            ?.payments
        ).toHaveLength(
          1
        );

        expect(
          paid.bills[0]
            ?.payments[0]
            ?.amount
        ).toBe(
          30
        );

        expect(
          paid.totals
            .recordedPayments
        ).toBe(
          30
        );

        expect(
          readPersonalFinancePeriodBudget(
            "2026-07"
          )
            .totals
            .projectedEndingBalance
        ).toBe(
          850
        );

        const closed =
          closePersonalFinanceAccountBalance(
            "2026-07",
            {
              accountKey:
                "checking",

              balance:
                875
            }
          );

        expect(
          closed.accounts[0]
            ?.closingBalance
        ).toBe(
          875
        );

        expect(
          closed.totals
            .closedCash
        ).toBe(
          875
        );

        createNextPersonalFinancePeriod(
          "2026-07"
        );

        const august =
          readPersonalFinanceReconciliationWorkspace(
            "2026-08"
          );

        expect(
          august.accounts[0]
            ?.openingBalance
        ).toBe(
          875
        );

        expect(
          august.accounts[0]
            ?.currentBalance
        ).toBe(
          875
        );

        expect(
          august.accounts[0]
            ?.closingBalance
        ).toBeNull();

        expect(
          august.bills[0]
            ?.planned
        ).toBe(
          100
        );

        expect(
          august.bills[0]
            ?.paid
        ).toBe(
          0
        );

        expect(
          august.bills[0]
            ?.payments
        ).toHaveLength(
          0
        );
      }
    );

    it(
      "rejects a zero bill payment",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),

          requestedPeriodKey:
            "2026-07"
        });

        expect(() =>
          recordPersonalFinanceBillPayment(
            "2026-07",
            {
              budgetItemKey:
                "electric",

              amount:
                0,

              paidOn:
                "2026-07-05"
            }
          )
        ).toThrow(
          "Payment amount must be greater than zero."
        );
      }
    );
  }
);
