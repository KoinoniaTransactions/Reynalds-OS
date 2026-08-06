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
  createPersonalFinanceObligation,
  readPersonalFinanceObligationCatalog
} from "./personal-finance-obligations-local";

let temporaryDirectory = "";
let databasePath = "";

beforeEach(() => {
  temporaryDirectory = mkdtempSync(
    path.join(
      os.tmpdir(),
      "personal-finance-obligations-"
    )
  );

  databasePath = path.join(
    temporaryDirectory,
    "test.sqlite3"
  );

  process.env.ENABLE_LOCAL_PERSONAL_FINANCE =
    "true";

  process.env.PERSONAL_FINANCE_DB_PATH =
    databasePath;

  process.env.PERSONAL_FINANCE_ENCRYPTION_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  const database =
    openPersonalFinanceDatabase({
      databasePath
    });

  database
    .prepare(`
      INSERT INTO accounts (
        id,
        source_key,
        institution,
        name,
        account_type,
        last_four
      )
      VALUES (
        'account_chase_checking',
        'account_chase_checking',
        'Chase',
        'Checking',
        'checking',
        '1234'
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

  delete process.env
    .PERSONAL_FINANCE_ENCRYPTION_KEY;

  rmSync(temporaryDirectory, {
    recursive: true,
    force: true
  });
});

describe(
  "personal finance obligations",
  () => {
    it(
      "creates a mortgage inside a financial home",
      () => {
        const created =
          createPersonalFinanceObligation({
            name: "Mortgage",
            obligationType:
              "mortgage",
            homeName:
              "Primary residence",
            homeKind: "home",
            provider:
              "Chase Home Lending",
            accountLastFour:
              "7788",
            expectedAmount:
              2150,
            dueDay: 2,
            frequency: "monthly",
            paymentMethod:
              "autopay",
            fundingAccountId:
              "account_chase_checking",
            isAutopay: true,
            paymentUrl:
              "https://example.com/pay",
            notes:
              "Paid from Chase Checking."
          });

        expect(created.name).toBe(
          "Mortgage"
        );

        expect(
          created.expectedAmount
        ).toBe(2150);

        expect(
          created.isAutopay
        ).toBe(true);

        const catalog =
          readPersonalFinanceObligationCatalog();

        expect(
          catalog.homes
        ).toHaveLength(1);

        expect(
          catalog.homes[0]?.name
        ).toBe(
          "Primary residence"
        );

        expect(
          catalog.obligations
        ).toHaveLength(1);

        expect(
          catalog.accounts
        ).toHaveLength(1);
      }
    );

    it(
      "creates a linked asset and liability from a financed bill",
      () => {
        createPersonalFinanceObligation({
          name: "Mortgage",
          obligationType: "mortgage",
          homeName:
            "Primary residence",
          homeKind: "home",
          provider:
            "Chase Home Lending",
          expectedAmount: 2150,
          assetName:
            "Primary residence",
          assetValue: 350000,
          assetValuedOn:
            "2026-08-06",
          currentBalance: 240000,
          originalBalance: 275000,
          interestRate: 6.25,
          minimumPayment: 2150,
          escrowPayment: 550,
          fullAccountNumber:
            "1234567890127788"
        });

        const database =
          openPersonalFinanceDatabase({
            databasePath
          });

        try {
          const asset = database
            .prepare(`
              SELECT
                id,
                name,
                asset_type
              FROM assets
            `)
            .get() as {
              id: string;
              name: string;
              asset_type: string;
            };

          const liability = database
            .prepare(`
              SELECT
                linked_asset_id,
                liability_type,
                current_balance_cents
              FROM liabilities
            `)
            .get() as {
              linked_asset_id: string;
              liability_type: string;
              current_balance_cents:
                number;
            };

          const sensitiveCount =
            database
              .prepare(`
                SELECT count(*) AS count
                FROM sensitive_values
              `)
              .get() as {
                count: number;
              };

          expect(asset.name).toBe(
            "Primary residence"
          );

          expect(asset.asset_type).toBe(
            "real_estate"
          );

          expect(
            liability.linked_asset_id
          ).toBe(asset.id);

          expect(
            liability.liability_type
          ).toBe("mortgage");

          expect(
            liability.current_balance_cents
          ).toBe(240_000_00);

          expect(
            sensitiveCount.count
          ).toBe(2);
        } finally {
          database.close();
        }
      }
    );

    it(
      "does not create an asset for an ordinary utility bill",
      () => {
        createPersonalFinanceObligation({
          name: "Electricity",
          obligationType: "utility",
          expectedAmount: 220
        });

        const database =
          openPersonalFinanceDatabase({
            databasePath
          });

        try {
          const assets = database
            .prepare(`
              SELECT count(*) AS count
              FROM assets
            `)
            .get() as {
              count: number;
            };

          const liabilities = database
            .prepare(`
              SELECT count(*) AS count
              FROM liabilities
            `)
            .get() as {
              count: number;
            };

          expect(assets.count).toBe(0);
          expect(
            liabilities.count
          ).toBe(0);
        } finally {
          database.close();
        }
      }
    );

    it(
      "rejects an invalid due day",
      () => {
        expect(() =>
          createPersonalFinanceObligation({
            name: "Electricity",
            obligationType:
              "utility",
            dueDay: 40
          })
        ).toThrow(
          "Due day must be between 1 and 31."
        );
      }
    );

    it(
      "reuses an existing financial home",
      () => {
        createPersonalFinanceObligation({
          name: "Mortgage",
          obligationType:
            "mortgage",
          homeName:
            "Primary residence",
          homeKind: "home"
        });

        createPersonalFinanceObligation({
          name: "Electricity",
          obligationType:
            "utility",
          homeName:
            "Primary residence",
          homeKind: "home"
        });

        const catalog =
          readPersonalFinanceObligationCatalog();

        expect(
          catalog.homes
        ).toHaveLength(1);

        expect(
          catalog.obligations
        ).toHaveLength(2);
      }
    );
  }
);
