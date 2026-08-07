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
  createPersonalFinanceObligation
} from "./personal-finance-obligations-local";

import {
  createNextPersonalFinancePeriod,
  preparePersonalFinancePeriodWorkspace,
  readPersonalFinancePeriodBudget
} from "./personal-finance-period-local";

import {
  closePersonalFinanceAccountBalance,
  deletePersonalFinanceBillPayment,
  readPersonalFinanceReconciliationWorkspace,
  recordPersonalFinanceBillPayment,
  syncPersonalFinanceDebtPayment,
  updatePersonalFinanceAccountCurrentBalance,
  updatePersonalFinanceBillPayment
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
      "edits and deletes an ordinary monthly payment without losing the imported starting amount",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),

          requestedPeriodKey:
            "2026-07"
        });

        const recorded =
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
                "First entry"
            }
          );

        const payment =
          recorded.bills[0]
            ?.payments[0];

        expect(
          payment
        ).toBeDefined();

        if (!payment) {
          throw new Error(
            "Test payment was not created."
          );
        }

        const updated =
          updatePersonalFinanceBillPayment(
            "2026-07",
            {
              paymentId:
                payment.id,

              amount:
                45,

              paidOn:
                "2026-07-06",

              note:
                "Corrected entry"
            }
          );

        expect(
          updated.bills[0]
            ?.paid
        ).toBe(
          65
        );

        expect(
          updated.bills[0]
            ?.remaining
        ).toBe(
          35
        );

        expect(
          updated.bills[0]
            ?.payments[0]
            ?.amount
        ).toBe(
          45
        );

        expect(
          updated.bills[0]
            ?.payments[0]
            ?.paidOn
        ).toBe(
          "2026-07-06"
        );

        const removed =
          deletePersonalFinanceBillPayment(
            "2026-07",
            {
              paymentId:
                payment.id
            }
          );

        expect(
          removed.bills[0]
            ?.paid
        ).toBe(
          20
        );

        expect(
          removed.bills[0]
            ?.remaining
        ).toBe(
          80
        );

        expect(
          removed.bills[0]
            ?.payments
        ).toHaveLength(
          0
        );
      }
    );

    it(
      "protects linked debt bills and synchronizes a debt-ledger payment exactly once",
      () => {
        preparePersonalFinancePeriodWorkspace({
          legacyBudget:
            legacyBudget(),

          requestedPeriodKey:
            "2026-07"
        });

        const obligation =
          createPersonalFinanceObligation({
            name:
              "Electric",

            obligationType:
              "mortgage",

            homeName:
              "Test home",

            homeKind:
              "home",

            budgetItemKey:
              "electric",

            provider:
              "Test Bank",

            expectedAmount:
              100,

            dueDay:
              5,

            frequency:
              "monthly",

            paymentMethod:
              "manual",

            assetName:
              "Test home",

            assetValue:
              300000,

            assetValuedOn:
              "2026-07-01",

            currentBalance:
              200000,

            originalBalance:
              250000
          });

        const protectedWorkspace =
          readPersonalFinanceReconciliationWorkspace(
            "2026-07"
          );

        expect(
          protectedWorkspace
            .bills[0]
            ?.requiresDebtLedger
        ).toBe(
          true
        );

        expect(
          protectedWorkspace
            .bills[0]
            ?.debtLedgerLabel
        ).toBe(
          "mortgage"
        );

        expect(() =>
          recordPersonalFinanceBillPayment(
            "2026-07",
            {
              budgetItemKey:
                "electric",

              amount:
                30,

              paidOn:
                "2026-07-05"
            }
          )
        ).toThrow(
          "This bill is linked to the debt ledger."
        );

        const synced =
          syncPersonalFinanceDebtPayment(
            "2026-07",
            {
              obligationId:
                obligation.id,

              paymentId:
                "loan-payment-1",

              amount:
                30,

              paidOn:
                "2026-07-05",

              note:
                "Debt ledger entry"
            }
          );

        expect(
          synced.synced
        ).toBe(
          true
        );

        expect(
          synced.workspace
            .bills[0]
            ?.paid
        ).toBe(
          50
        );

        expect(
          synced.workspace
            .bills[0]
            ?.remaining
        ).toBe(
          50
        );

        const debtPayment =
          synced.workspace
            .bills[0]
            ?.payments[0];

        expect(
          debtPayment
            ?.sourceKind
        ).toBe(
          "debt"
        );

        expect(
          debtPayment
            ?.sourcePaymentId
        ).toBe(
          "loan-payment-1"
        );

        const duplicate =
          syncPersonalFinanceDebtPayment(
            "2026-07",
            {
              obligationId:
                obligation.id,

              paymentId:
                "loan-payment-1",

              amount:
                30,

              paidOn:
                "2026-07-05"
            }
          );

        expect(
          duplicate.synced
        ).toBe(
          false
        );

        expect(
          duplicate.workspace
            .bills[0]
            ?.paid
        ).toBe(
          50
        );

        expect(
          duplicate.workspace
            .bills[0]
            ?.payments
        ).toHaveLength(
          1
        );

        if (!debtPayment) {
          throw new Error(
            "Debt payment was not synchronized."
          );
        }

        expect(() =>
          updatePersonalFinanceBillPayment(
            "2026-07",
            {
              paymentId:
                debtPayment.id,

              amount:
                35,

              paidOn:
                "2026-07-05"
            }
          )
        ).toThrow(
          "Debt-ledger payment history must be corrected in the debt ledger."
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
