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
  applyLoanPayment,
  calculateScheduledPayment,
  configureLoanTerms,
  previewLoanPayment,
  readLoanPaymentWorkspace
} from "./personal-finance-loan-ledger-local";

let temporaryDirectory = "";
let databasePath = "";

beforeEach(() => {
  temporaryDirectory =
    mkdtempSync(
      path.join(
        os.tmpdir(),
        "personal-finance-loan-ledger-"
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

  const database =
    openPersonalFinanceDatabase({
      databasePath
    });

  database
    .prepare(`
      INSERT INTO obligation_homes (
        id,
        name,
        kind
      )
      VALUES (
        'home_primary',
        'Primary residence',
        'home'
      )
    `)
    .run();

  database
    .prepare(`
      INSERT INTO obligations (
        id,
        home_id,
        name,
        obligation_type,
        expected_amount_cents
      )
      VALUES (
        'obligation_mortgage',
        'home_primary',
        'Mortgage',
        'mortgage',
        215000
      )
    `)
    .run();

  database
    .prepare(`
      INSERT INTO assets (
        id,
        name,
        asset_type
      )
      VALUES (
        'asset_home',
        'Primary residence',
        'real_estate'
      )
    `)
    .run();

  database
    .prepare(`
      INSERT INTO asset_valuations (
        id,
        asset_id,
        value_cents,
        valued_on
      )
      VALUES (
        'valuation_home',
        'asset_home',
        35000000,
        '2026-08-01'
      )
    `)
    .run();

  database
    .prepare(`
      INSERT INTO liabilities (
        id,
        obligation_id,
        linked_asset_id,
        name,
        liability_type,
        original_balance_cents,
        current_balance_cents,
        balance_as_of,
        interest_rate_basis_points,
        minimum_payment_cents,
        escrow_payment_cents
      )
      VALUES (
        'liability_mortgage',
        'obligation_mortgage',
        'asset_home',
        'Primary mortgage',
        'mortgage',
        27500000,
        24000000,
        '2026-08-01',
        625,
        215000,
        55000
      )
    `)
    .run();

  database.close();
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
  "personal finance loan ledger",
  () => {
    it(
      "calculates a standard amortized payment",
      () => {
        expect(
          calculateScheduledPayment({
            principal: 275000,
            annualInterestRate: 6.25,
            termMonths: 360
          })
        ).toBeCloseTo(
          1693.22,
          2
        );
      }
    );

    it(
      "applies only principal to the outstanding balance",
      () => {
        configureLoanTerms({
          liabilityId:
            "liability_mortgage",
          calculationMethod:
            "monthly_amortization",
          annualInterestRate:
            6.25,
          originalTermMonths:
            360,
          remainingTermMonths:
            288,
          loanStartDate:
            "2022-08-01",
          firstPaymentDate:
            "2022-09-01",
          paymentFrequency:
            "monthly",
          scheduledPayment:
            2150,
          scheduledEscrow:
            550,
          rateType: "fixed",
          lastAccrualDate:
            "2026-07-01"
        });

        const result =
          applyLoanPayment({
            obligationId:
              "obligation_mortgage",
            sourceKey:
              "bill-payment-2026-08",
            paidOn:
              "2026-08-01",
            totalPayment:
              2150,
            escrow: 550
          });

        expect(result.interest)
          .toBe(1250);

        expect(result.principal)
          .toBe(350);

        expect(result.closingBalance)
          .toBe(239650);

        const database =
          openPersonalFinanceDatabase({
            databasePath
          });

        try {
          const liability =
            database
              .prepare(`
                SELECT
                  current_balance_cents
                FROM liabilities
                WHERE id =
                  'liability_mortgage'
              `)
              .get() as {
                current_balance_cents:
                  number;
              };

          const history =
            database
              .prepare(`
                SELECT
                  count(*) AS count
                FROM
                  liability_balance_history
              `)
              .get() as {
                count: number;
              };

          expect(
            liability
              .current_balance_cents
          ).toBe(23965000);

          expect(history.count)
            .toBe(1);
        } finally {
          database.close();
        }
      }
    );

    it(
      "previews a payment without changing the balance",
      () => {
        configureLoanTerms({
          liabilityId:
            "liability_mortgage",
          calculationMethod:
            "monthly_amortization",
          annualInterestRate:
            6.25,
          paymentFrequency:
            "monthly",
          scheduledEscrow:
            550,
          lastAccrualDate:
            "2026-07-01"
        });

        const preview =
          previewLoanPayment({
            obligationId:
              "obligation_mortgage",
            sourceKey:
              "preview-only",
            paidOn:
              "2026-08-01",
            totalPayment:
              2150,
            escrow:
              550
          });

        expect(preview.interest)
          .toBe(1250);

        expect(preview.principal)
          .toBe(350);

        expect(
          preview.projectedBalance
        ).toBe(239650);

        const database =
          openPersonalFinanceDatabase({
            databasePath
          });

        try {
          const liability =
            database
              .prepare(`
                SELECT
                  current_balance_cents
                FROM liabilities
                WHERE id =
                  'liability_mortgage'
              `)
              .get() as {
                current_balance_cents:
                  number;
              };

          const payments =
            database
              .prepare(`
                SELECT count(*) AS count
                FROM liability_payments
              `)
              .get() as {
                count: number;
              };

          expect(
            liability
              .current_balance_cents
          ).toBe(24000000);

          expect(payments.count)
            .toBe(0);
        } finally {
          database.close();
        }
      }
    );

    it(
      "returns linked bills for the payment workspace",
      () => {
        configureLoanTerms({
          liabilityId:
            "liability_mortgage",
          calculationMethod:
            "monthly_amortization",
          annualInterestRate:
            6.25,
          paymentFrequency:
            "monthly",
          scheduledEscrow:
            550
        });

        const records =
          readLoanPaymentWorkspace();

        expect(records)
          .toHaveLength(1);

        expect(
          records[0]?.billName
        ).toBe("Mortgage");

        expect(
          records[0]
            ?.hasConfiguredTerms
        ).toBe(true);

        expect(
          records[0]
            ?.currentBalance
        ).toBe(240000);
      }
    );

    it(
      "prevents the same payment from being applied twice",
      () => {
        configureLoanTerms({
          liabilityId:
            "liability_mortgage",
          calculationMethod:
            "monthly_amortization",
          annualInterestRate:
            6.25,
          paymentFrequency:
            "monthly",
          lastAccrualDate:
            "2026-07-01"
        });

        applyLoanPayment({
          obligationId:
            "obligation_mortgage",
          sourceKey:
            "duplicate-payment",
          paidOn:
            "2026-08-01",
          totalPayment:
            2150,
          escrow: 550
        });

        expect(() =>
          applyLoanPayment({
            obligationId:
              "obligation_mortgage",
            sourceKey:
              "duplicate-payment",
            paidOn:
              "2026-08-01",
            totalPayment:
              2150,
            escrow: 550
          })
        ).toThrow(
          "This payment has already been applied."
        );
      }
    );

    it(
      "requires loan terms before automatic allocation",
      () => {
        expect(() =>
          applyLoanPayment({
            obligationId:
              "obligation_mortgage",
            sourceKey:
              "missing-terms",
            paidOn:
              "2026-08-01",
            totalPayment:
              2150,
            escrow: 550
          })
        ).toThrow(
          "Loan terms must be configured before applying a payment."
        );
      }
    );
  }
);
