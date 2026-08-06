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
