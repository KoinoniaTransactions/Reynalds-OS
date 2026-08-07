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
  createPersonalFinanceIncomeSource,
  deletePersonalFinanceIncomeSource,
  readPersonalFinanceIncomeWorkspace,
  setPersonalFinanceIncomeSourceActive,
  updatePersonalFinanceIncomeReceipt,
  updatePersonalFinanceIncomeSource
} from "./personal-finance-income-local";

let temporaryDirectory = "";
let databasePath = "";

beforeEach(() => {
  temporaryDirectory =
    mkdtempSync(
      path.join(
        os.tmpdir(),
        "income-source-lifecycle-"
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
  "personal finance income source lifecycle",
  () => {
    it(
      "edits, pauses, reactivates, and safely deletes a recurring source while preserving receipts",
      () => {
        const created =
          createPersonalFinanceIncomeSource(
            "2026-08",
            {
              recipientName:
                "Jeremiah",

              sourceName:
                "Reynalds Brothers",

              sourceType:
                "employment",

              schedule:
                "weekly",

              expectedAmount:
                1560,

              anchorDate:
                "2026-08-07",

              activeFromPeriod:
                "2026-08",

              depositAccountLabel:
                "Checking"
            }
          );

        expect(
          created.sources
        ).toHaveLength(
          1
        );

        expect(
          created.occurrences
        ).toHaveLength(
          4
        );

        const source =
          created.sources[0];

        const firstOccurrence =
          created.occurrences[0];

        expect(source).toBeDefined();
        expect(firstOccurrence).toBeDefined();

        if (
          !source ||
          !firstOccurrence
        ) {
          throw new Error(
            "Test source was not created."
          );
        }

        updatePersonalFinanceIncomeReceipt(
          "2026-08",
          {
            occurrenceId:
              firstOccurrence.id,

            receivedAmount:
              1560,

            receivedDate:
              firstOccurrence
                .expectedDate
          }
        );

        const edited =
          updatePersonalFinanceIncomeSource(
            "2026-08",
            {
              sourceId:
                source.id,

              recipientName:
                "Jeremiah",

              sourceName:
                "Reynalds Brothers Updated",

              sourceType:
                "employment",

              schedule:
                "weekly",

              expectedAmount:
                1600,

              anchorDate:
                "2026-08-07",

              activeFromPeriod:
                "2026-08",

              endPeriod:
                "2026-12",

              depositAccountLabel:
                "Navy Federal Checking"
            }
          );

        expect(
          edited.sources[0]
            ?.expectedAmount
        ).toBe(
          1600
        );

        expect(
          edited.sources[0]
            ?.endPeriod
        ).toBe(
          "2026-12"
        );

        expect(
          edited.occurrences
        ).toHaveLength(
          4
        );

        const received =
          edited.occurrences
            .find(
              (occurrence) =>
                occurrence.id ===
                firstOccurrence.id
            );

        expect(
          received?.received
        ).toBe(
          1560
        );

        const regenerated =
          edited.occurrences
            .filter(
              (occurrence) =>
                occurrence.id !==
                firstOccurrence.id
            );

        expect(
          regenerated.every(
            (occurrence) =>
              occurrence.expected ===
              1600
          )
        ).toBe(
          true
        );

        const paused =
          setPersonalFinanceIncomeSourceActive(
            "2026-08",
            {
              sourceId:
                source.id,

              isActive:
                false
            }
          );

        expect(
          paused.sources[0]
            ?.isActive
        ).toBe(
          false
        );

        expect(
          paused.occurrences
        ).toHaveLength(
          1
        );

        expect(
          paused.occurrences[0]
            ?.received
        ).toBe(
          1560
        );

        const reactivated =
          setPersonalFinanceIncomeSourceActive(
            "2026-08",
            {
              sourceId:
                source.id,

              isActive:
                true
            }
          );

        expect(
          reactivated.sources[0]
            ?.isActive
        ).toBe(
          true
        );

        expect(
          reactivated.occurrences
        ).toHaveLength(
          4
        );

        const deleted =
          deletePersonalFinanceIncomeSource(
            "2026-08",
            {
              sourceId:
                source.id
            }
          );

        expect(
          deleted.sources
        ).toHaveLength(
          0
        );

        expect(
          deleted.occurrences
        ).toHaveLength(
          1
        );

        expect(
          deleted.occurrences[0]
            ?.received
        ).toBe(
          1560
        );

        expect(
          deleted.occurrences[0]
            ?.sourceId
        ).toBeNull();
      }
    );

    it(
      "stops generating income after an end month",
      () => {
        createPersonalFinanceIncomeSource(
          "2026-08",
          {
            recipientName:
              "Maurene",

            sourceName:
              "DDS",

            sourceType:
              "employment",

            schedule:
              "monthly",

            expectedAmount:
              5700,

            anchorDate:
              "2026-08-15",

            activeFromPeriod:
              "2026-08",

            endPeriod:
              "2026-08"
          }
        );

        const august =
          readPersonalFinanceIncomeWorkspace(
            "2026-08"
          );

        expect(
          august.occurrences
        ).toHaveLength(
          1
        );

        const september =
          readPersonalFinanceIncomeWorkspace(
            "2026-09"
          );

        expect(
          september.occurrences
        ).toHaveLength(
          0
        );

        expect(
          september.sources
        ).toHaveLength(
          1
        );
      }
    );
  }
);
