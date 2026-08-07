import {
  describe,
  expect,
  it
} from "vitest";

import {
  generateIncomeOccurrenceDates,
  personalFinanceNextPeriodKey,
  personalFinancePeriodKeyFromMonthLabel,
  personalFinancePeriodLabel
} from "./personal-finance-income-schedule";

describe(
  "personal finance income schedule",
  () => {
    it(
      "converts a month label to a period key",
      () => {
        expect(
          personalFinancePeriodKeyFromMonthLabel(
            "July 2026"
          )
        ).toBe(
          "2026-07"
        );

        expect(
          personalFinancePeriodLabel(
            "2026-07"
          )
        ).toBe(
          "July 2026"
        );
      }
    );

    it(
      "advances to the next period",
      () => {
        expect(
          personalFinanceNextPeriodKey(
            "2026-12"
          )
        ).toBe(
          "2027-01"
        );
      }
    );

    it(
      "generates weekly paydays",
      () => {
        expect(
          generateIncomeOccurrenceDates({
            periodKey:
              "2026-07",
            schedule:
              "weekly",
            anchorDate:
              "2026-07-03"
          })
        ).toEqual([
          "2026-07-03",
          "2026-07-10",
          "2026-07-17",
          "2026-07-24",
          "2026-07-31"
        ]);
      }
    );

    it(
      "generates biweekly paydays",
      () => {
        expect(
          generateIncomeOccurrenceDates({
            periodKey:
              "2026-07",
            schedule:
              "biweekly",
            anchorDate:
              "2026-07-03"
          })
        ).toEqual([
          "2026-07-03",
          "2026-07-17",
          "2026-07-31"
        ]);
      }
    );

    it(
      "generates twice-monthly paydays",
      () => {
        expect(
          generateIncomeOccurrenceDates({
            periodKey:
              "2026-07",
            schedule:
              "semimonthly",
            anchorDate:
              "2026-07-15",
            secondPayDay:
              31
          })
        ).toEqual([
          "2026-07-15",
          "2026-07-31"
        ]);
      }
    );

    it(
      "clamps a monthly payday to the end of a short month",
      () => {
        expect(
          generateIncomeOccurrenceDates({
            periodKey:
              "2026-02",
            schedule:
              "monthly",
            anchorDate:
              "2026-01-31"
          })
        ).toEqual([
          "2026-02-28"
        ]);
      }
    );

    it(
      "does not auto-generate irregular income",
      () => {
        expect(
          generateIncomeOccurrenceDates({
            periodKey:
              "2026-07",
            schedule:
              "irregular",
            anchorDate:
              null
          })
        ).toEqual([]);
      }
    );
  }
);
