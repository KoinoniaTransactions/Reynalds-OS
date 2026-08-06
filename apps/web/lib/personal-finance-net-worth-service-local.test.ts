import {
  mkdtempSync,
  rmSync
} from "node:fs";

import {
  tmpdir
} from "node:os";

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
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

import {
  createPersonalFinanceNetWorthRecord,
  readPersonalFinanceNetWorthCatalog
} from "./personal-finance-net-worth-service-local";

const TEST_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

let testDirectory = "";

beforeEach(() => {
  testDirectory =
    mkdtempSync(
      path.join(
        tmpdir(),
        "personal-finance-net-worth-"
      )
    );

  process.env
    .ENABLE_LOCAL_PERSONAL_FINANCE =
    "true";

  process.env
    .PERSONAL_FINANCE_DB_PATH =
    path.join(
      testDirectory,
      "test.sqlite3"
    );

  process.env
    .PERSONAL_FINANCE_ENCRYPTION_KEY =
    TEST_KEY;
});

afterEach(() => {
  delete process.env
    .ENABLE_LOCAL_PERSONAL_FINANCE;

  delete process.env
    .PERSONAL_FINANCE_DB_PATH;

  delete process.env
    .PERSONAL_FINANCE_ENCRYPTION_KEY;

  rmSync(testDirectory, {
    recursive: true,
    force: true
  });
});

describe(
  "personal finance net-worth service",
  () => {
    it(
      "creates an asset and linked liability",
      () => {
        const afterAsset =
          createPersonalFinanceNetWorthRecord({
            recordType: "asset",
            name: "Primary home",
            assetType:
              "real_estate",
            value: 350000,
            valuedOn:
              "2026-08-06",
            accountNumber:
              "ASSET-123456789"
          });

        const asset =
          afterAsset.assets[0];

        expect(asset).toBeDefined();

        const afterLiability =
          createPersonalFinanceNetWorthRecord({
            recordType:
              "liability",
            name: "Mortgage",
            liabilityType:
              "mortgage",
            linkedAssetId:
              asset?.id,
            currentBalance:
              240000,
            originalBalance:
              275000,
            interestRate:
              6.25,
            minimumPayment:
              1850,
            escrowPayment:
              550,
            balanceAsOf:
              "2026-08-06",
            accountNumber:
              "MORTGAGE-987654321"
          });

        expect(
          afterLiability.summary
            .totalAssetsCents
        ).toBe(350_000_00);

        expect(
          afterLiability.summary
            .totalLiabilitiesCents
        ).toBe(240_000_00);

        expect(
          afterLiability.summary
            .netWorthCents
        ).toBe(110_000_00);

        expect(
          afterLiability.summary
            .assetEquity[0]
            ?.equityCents
        ).toBe(110_000_00);

        expect(
          afterLiability
            .liabilities[0]
            ?.maskedAccountNumber
        ).toBe("•••• 4321");
      }
    );

    it(
      "creates an asset with a linked liability and recurring bill",
      () => {
        const catalog =
          createPersonalFinanceNetWorthRecord({
            recordType: "asset",
            name: "Primary residence",
            assetType:
              "real_estate",
            value: 350000,
            valuedOn:
              "2026-08-06",
            hasAttachedLiability:
              true,
            liabilityName:
              "Primary mortgage",
            liabilityType:
              "mortgage",
            liabilityInstitution:
              "Chase Home Lending",
            originalBalance:
              275000,
            currentBalance:
              240000,
            balanceAsOf:
              "2026-08-06",
            interestRate:
              6.25,
            minimumPayment:
              2150,
            escrowPayment:
              550,
            liabilityAccountNumber:
              "1234567890127788",
            createRecurringBill:
              true,
            billName:
              "Mortgage payment",
            billDueDay: 2,
            billFrequency:
              "monthly",
            billPaymentMethod:
              "autopay",
            billIsAutopay:
              true
          });

        expect(
          catalog.assets
        ).toHaveLength(1);

        expect(
          catalog.liabilities
        ).toHaveLength(1);

        expect(
          catalog.liabilities[0]
            ?.linkedAssetId
        ).toBe(
          catalog.assets[0]?.id
        );

        expect(
          catalog.liabilities[0]
            ?.obligationId
        ).not.toBeNull();

        expect(
          catalog.summary
            .netWorthCents
        ).toBe(110_000_00);

        const database =
          openPersonalFinanceDatabase();

        try {
          const obligation =
            database
              .prepare(`
                SELECT
                  obligation_type,
                  expected_amount_cents,
                  due_day,
                  is_autopay
                FROM obligations
              `)
              .get() as {
                obligation_type: string;
                expected_amount_cents:
                  number;
                due_day: number;
                is_autopay: number;
              };

          expect(
            obligation.obligation_type
          ).toBe("mortgage");

          expect(
            obligation
              .expected_amount_cents
          ).toBe(2150_00);

          expect(
            obligation.due_day
          ).toBe(2);

          expect(
            obligation.is_autopay
          ).toBe(1);
        } finally {
          database.close();
        }
      }
    );

    it(
      "creates a free-and-clear asset without a liability",
      () => {
        const catalog =
          createPersonalFinanceNetWorthRecord({
            recordType: "asset",
            name: "Savings reserve",
            assetType: "savings",
            value: 15000,
            valuedOn:
              "2026-08-06",
            hasAttachedLiability:
              false
          });

        expect(
          catalog.assets
        ).toHaveLength(1);

        expect(
          catalog.liabilities
        ).toHaveLength(0);

        expect(
          catalog.summary
            .netWorthCents
        ).toBe(15_000_00);
      }
    );

    it(
      "does not return encrypted account-number material",
      () => {
        createPersonalFinanceNetWorthRecord({
          recordType:
            "liability",
          name: "Auto loan",
          liabilityType:
            "auto_loan",
          currentBalance:
            18000,
          accountNumber:
            "AUTO-1111222233334444"
        });

        const serialized =
          JSON.stringify(
            readPersonalFinanceNetWorthCatalog()
          );

        expect(serialized).not.toContain(
          "1111222233334444"
        );

        expect(serialized).not.toContain(
          "ciphertext"
        );

        expect(serialized).toContain(
          "•••• 4444"
        );
      }
    );

    it(
      "rejects a missing linked asset",
      () => {
        expect(() =>
          createPersonalFinanceNetWorthRecord({
            recordType:
              "liability",
            name: "Mortgage",
            liabilityType:
              "mortgage",
            linkedAssetId:
              "missing-asset",
            currentBalance:
              200000
          })
        ).toThrow(
          "Linked asset was not found."
        );
      }
    );
  }
);
