import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync
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
  createPersonalFinanceDemoBudget,
  getPersonalFinanceBootstrapControlPath,
  readPersonalFinanceBootstrapMode
} from "./personal-finance-bootstrap-local";

import {
  loadLocalPersonalFinance
} from "./personal-finance-local";

describe(
  "Personal Finance bootstrap modes",
  () => {
    let tempDirectory:
      string;

    const originalEnabled =
      process.env
        .ENABLE_LOCAL_PERSONAL_FINANCE;

    const originalDatabasePath =
      process.env
        .PERSONAL_FINANCE_DB_PATH;

    const originalControlPath =
      process.env
        .PERSONAL_FINANCE_BOOTSTRAP_MODE_PATH;

    const originalCsvPath =
      process.env
        .PERSONAL_FINANCE_CSV_PATH;

    beforeEach(
      () => {
        tempDirectory =
          mkdtempSync(
            path.join(
              os.tmpdir(),
              "jm-finance-bootstrap-"
            )
          );

        process.env
          .ENABLE_LOCAL_PERSONAL_FINANCE =
          "true";

        process.env
          .PERSONAL_FINANCE_DB_PATH =
          path.join(
            tempDirectory,
            "personal-finance.sqlite3"
          );

        delete process.env
          .PERSONAL_FINANCE_BOOTSTRAP_MODE_PATH;

        delete process.env
          .PERSONAL_FINANCE_CSV_PATH;
      }
    );

    afterEach(
      () => {
        restoreEnvironment(
          "ENABLE_LOCAL_PERSONAL_FINANCE",
          originalEnabled
        );

        restoreEnvironment(
          "PERSONAL_FINANCE_DB_PATH",
          originalDatabasePath
        );

        restoreEnvironment(
          "PERSONAL_FINANCE_BOOTSTRAP_MODE_PATH",
          originalControlPath
        );

        restoreEnvironment(
          "PERSONAL_FINANCE_CSV_PATH",
          originalCsvPath
        );

        rmSync(
          tempDirectory,
          {
            force:
              true,

            recursive:
              true
          }
        );
      }
    );

    it(
      "keeps legacy CSV behavior when no control file exists",
      async () => {
        await expect(
          readPersonalFinanceBootstrapMode()
        ).resolves.toBe(
          "legacy_csv"
        );
      }
    );

    it(
      "uses clean launch mode without reading a legacy CSV",
      async () => {
        writeControl(
          "clean"
        );

        const result =
          await loadLocalPersonalFinance();

        expect(
          result.budget
        ).toBeNull();

        expect(
          result.reason
        ).toContain(
          "clean launch mode"
        );
      }
    );

    it(
      "loads only synthetic values in demo mode",
      async () => {
        writeControl(
          "demo"
        );

        const result =
          await loadLocalPersonalFinance();

        expect(
          result.reason
        ).toBeNull();

        expect(
          result.budget
            ?.month
        ).toBe(
          "January 2030"
        );

        expect(
          result.budget
            ?.sourceFile
        ).toBe(
          "synthetic-demo-data"
        );

        expect(
          result.budget
            ?.bills
            .every(
              (bill) =>
                bill.name
                  .startsWith(
                    "Demo "
                  )
            )
        ).toBe(
          true
        );

        expect(
          result.budget
            ?.accounts
            .every(
              (account) =>
                account.name
                  .startsWith(
                    "Demo "
                  )
            )
        ).toBe(
          true
        );
      }
    );

    it(
      "keeps the synthetic budget internally consistent",
      () => {
        const budget =
          createPersonalFinanceDemoBudget();

        const planned =
          budget.bills.reduce(
            (
              total,
              bill
            ) =>
              total +
              bill.budgeted,
            0
          );

        const expectedIncome =
          budget.income.reduce(
            (
              total,
              entry
            ) =>
              total +
              entry.expected,
            0
          );

        expect(
          budget.totals
            .expensesBudgeted
        ).toBe(
          planned
        );

        expect(
          budget.totals
            .billsRemaining
        ).toBe(
          planned
        );

        expect(
          budget.totals
            .incomeExpected
        ).toBe(
          expectedIncome
        );

        expect(
          budget.sourceFile
        ).toContain(
          "synthetic"
        );
      }
    );

    function writeControl(
      mode:
        "clean" |
        "demo"
    ): void {
      const controlPath =
        getPersonalFinanceBootstrapControlPath();

      mkdirSync(
        path.dirname(
          controlPath
        ),
        {
          recursive:
            true
        }
      );

      writeFileSync(
        controlPath,
        JSON.stringify({
          version:
            1,

          mode
        }),
        "utf8"
      );
    }
  }
);

function restoreEnvironment(
  name: string,
  value:
    string |
    undefined
): void {
  if (
    value ===
    undefined
  ) {
    delete process.env[
      name
    ];

    return;
  }

  process.env[
    name
  ] = value;
}
