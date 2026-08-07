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

import {
  createPersonalFinanceIncomeSource
} from "./personal-finance-income-local";

import type {
  PersonalFinanceMonth
} from "./personal-finance-local";

import {
  createNextPersonalFinancePeriod,
  preparePersonalFinancePeriodWorkspace,
  selectPersonalFinancePeriod
} from "./personal-finance-period-local";

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
        200,
      incomeReceived:
        50,
      incomeRemaining:
        150,
      totalBankBalance:
        1000,
      projectedEndingBalance:
        1070,
      totalCreditLimit:
        1000,
      totalCreditBalance:
        300,
      totalMinimumPayments:
        25,
      totalAvailableCredit:
        700
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

    income: [
      {
        id:
          "legacy-income-1",
        date:
          "7/3/2026",
        expected:
          200,
        received:
          50
      }
    ],

    accounts: [
      {
        id:
          "checking",
        name:
          "Checking",
        amount:
          1000
      },
      {
        id:
          "bank-total",
        name:
          "Tot Bank Bal",
        amount:
          1000,
        emphasis:
          true
      }
    ],

    creditAccounts: [
      {
        id:
          "credit-1",
        name:
          "Credit card",
        limit:
          1000,
        balance:
          300,
        minimumPayment:
          25,
        available:
          700
      }
    ],

    irregularExpenses: []
  };
}

beforeEach(() => {
  temporaryDirectory =
    mkdtempSync(
      path.join(
        os.tmpdir(),
        "personal-finance-periods-"
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
  "personal finance budget periods",
  () => {
    it(
      "imports the starting month and builds the next month",
      () => {
        const july =
          preparePersonalFinancePeriodWorkspace({
            legacyBudget:
              legacyBudget(),
            requestedPeriodKey:
              "2026-07"
          });

        expect(
          july.periodKey
        ).toBe(
          "2026-07"
        );

        expect(
          july.budget
            ?.totals
            .totalBankBalance
        ).toBe(
          1000
        );

        expect(
          july.budget
            ?.bills[0]
            ?.paid
        ).toBe(
          20
        );

        createPersonalFinanceIncomeSource(
          "2026-07",
          {
            recipientName:
              "Jeremiah",
            sourceName:
              "Employer",
            sourceType:
              "employment",
            schedule:
              "biweekly",
            expectedAmount:
              500,
            anchorDate:
              "2026-07-03",
            activeFromPeriod:
              "2026-08"
          }
        );

        const created =
          createNextPersonalFinancePeriod(
            "2026-07"
          );

        expect(
          created.created
        ).toBe(
          true
        );

        expect(
          created
            .period
            .periodKey
        ).toBe(
          "2026-08"
        );

        const august =
          preparePersonalFinancePeriodWorkspace({
            legacyBudget:
              null,
            requestedPeriodKey:
              "2026-08"
          });

        expect(
          august.budget
            ?.bills
        ).toHaveLength(
          1
        );

        expect(
          august.budget
            ?.bills[0]
            ?.budgeted
        ).toBe(
          100
        );

        expect(
          august.budget
            ?.bills[0]
            ?.paid
        ).toBe(
          0
        );

        expect(
          august.budget
            ?.bills[0]
            ?.due
        ).toBe(
          "8/5/2026"
        );

        expect(
          august.budget
            ?.totals
            .totalBankBalance
        ).toBe(
          1000
        );

        expect(
          august.budget
            ?.creditAccounts[0]
            ?.balance
        ).toBe(
          300
        );

        expect(
          august.budget
            ?.goal
        ).toBe(
          500
        );

        expect(
          august.budget
            ?.income
        ).toHaveLength(
          2
        );

        expect(
          august.budget
            ?.totals
            .incomeExpected
        ).toBe(
          1000
        );

        expect(
          august.budget
            ?.totals
            .projectedEndingBalance
        ).toBe(
          1900
        );
      }
    );

    it(
      "can build a clean month without carrying the old plan",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),
          requestedPeriodKey:
            "2026-07"
        });

        createNextPersonalFinancePeriod(
          "2026-07",
          {
            carryBills:
              false,
            carryAccounts:
              false,
            carryGoal:
              false
          }
        );

        const august =
          preparePersonalFinancePeriodWorkspace({
            legacyBudget:
              null,
            requestedPeriodKey:
              "2026-08"
          });

        expect(
          august.budget
            ?.bills
        ).toHaveLength(
          0
        );

        expect(
          august.budget
            ?.accounts
        ).toHaveLength(
          0
        );

        expect(
          august.budget
            ?.creditAccounts
        ).toHaveLength(
          0
        );

        expect(
          august.budget
            ?.goal
        ).toBe(
          0
        );
      }
    );

    it(
      "persists the selected application month",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),
          requestedPeriodKey:
            "2026-07"
        });

        createNextPersonalFinancePeriod(
          "2026-07"
        );

        selectPersonalFinancePeriod(
          "2026-07"
        );

        const selected =
          preparePersonalFinancePeriodWorkspace({
            legacyBudget:
              null,
            requestedPeriodKey:
              null
          });

        expect(
          selected.periodKey
        ).toBe(
          "2026-07"
        );
      }
    );

    it(
      "persists a valid month requested through the route",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),
          requestedPeriodKey:
            "2026-07"
        });

        createNextPersonalFinancePeriod(
          "2026-07"
        );

        selectPersonalFinancePeriod(
          "2026-07"
        );

        const requested =
          preparePersonalFinancePeriodWorkspace({
            legacyBudget:
              null,
            requestedPeriodKey:
              "2026-08"
          });

        expect(
          requested.periodKey
        ).toBe(
          "2026-08"
        );

        const persisted =
          preparePersonalFinancePeriodWorkspace({
            legacyBudget:
              null,
            requestedPeriodKey:
              null
          });

        expect(
          persisted.periodKey
        ).toBe(
          "2026-08"
        );
      }
    );
  }
);
