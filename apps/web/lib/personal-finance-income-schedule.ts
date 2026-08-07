import type {
  PersonalFinanceIncomeSchedule
} from "./personal-finance-income-types";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
] as const;

const DAY_MS =
  24 * 60 * 60 * 1000;

export function personalFinancePeriodKeyFromMonthLabel(
  label: string
): string | null {
  const match = label
    .trim()
    .replace(/\s+budget$/i, "")
    .match(
      /^([a-z]+)\s+(\d{4})$/i
    );

  if (!match) {
    return null;
  }

  const monthName =
    match[1]?.toLowerCase() ?? "";

  const monthIndex =
    MONTH_NAMES.indexOf(
      monthName as
        typeof MONTH_NAMES[number]
    );

  const year =
    Number(match[2]);

  if (
    monthIndex === -1 ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  return `${year}-${String(
    monthIndex + 1
  ).padStart(2, "0")}`;
}

export function personalFinancePeriodLabel(
  periodKey: string
): string {
  const {
    year,
    month
  } = parsePeriodKey(periodKey);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }
  ).format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        1
      )
    )
  );
}

export function personalFinanceNextPeriodKey(
  periodKey: string
): string {
  const {
    year,
    month
  } = parsePeriodKey(periodKey);

  const date = new Date(
    Date.UTC(
      year,
      month,
      1
    )
  );

  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")
  ].join("-");
}

export function personalFinancePreviousPeriodKey(
  periodKey: string
): string {
  const {
    year,
    month
  } = parsePeriodKey(periodKey);

  const date = new Date(
    Date.UTC(
      year,
      month - 2,
      1
    )
  );

  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")
  ].join("-");
}

export function generateIncomeOccurrenceDates({
  periodKey,
  schedule,
  anchorDate,
  secondPayDay
}: {
  periodKey: string;
  schedule:
    PersonalFinanceIncomeSchedule;
  anchorDate: string | null;
  secondPayDay?: number | null;
}): string[] {
  const {
    year,
    month
  } = parsePeriodKey(periodKey);

  if (
    schedule === "irregular"
  ) {
    return [];
  }

  if (!anchorDate) {
    throw new Error(
      "A known payday is required for recurring income."
    );
  }

  const anchor =
    parseIsoDate(anchorDate);

  if (
    schedule === "monthly"
  ) {
    return [
      isoDate(
        year,
        month,
        clampDay(
          year,
          month,
          anchor.getUTCDate()
        )
      )
    ];
  }

  if (
    schedule ===
    "semimonthly"
  ) {
    if (
      secondPayDay === null ||
      secondPayDay === undefined ||
      !Number.isInteger(
        secondPayDay
      ) ||
      secondPayDay < 1 ||
      secondPayDay > 31
    ) {
      throw new Error(
        "A second pay day from 1 through 31 is required for twice-monthly income."
      );
    }

    const firstDay =
      clampDay(
        year,
        month,
        anchor.getUTCDate()
      );

    const secondDay =
      clampDay(
        year,
        month,
        secondPayDay
      );

    return Array.from(
      new Set([
        isoDate(
          year,
          month,
          firstDay
        ),
        isoDate(
          year,
          month,
          secondDay
        )
      ])
    ).sort();
  }

  const intervalDays =
    schedule === "weekly"
      ? 7
      : 14;

  const periodStart =
    Date.UTC(
      year,
      month - 1,
      1
    );

  const periodEnd =
    Date.UTC(
      year,
      month,
      1
    );

  const anchorTime =
    anchor.getTime();

  const rawSteps =
    (
      periodStart -
      anchorTime
    ) /
    (
      intervalDays *
      DAY_MS
    );

  let cursor =
    anchorTime +
    Math.ceil(rawSteps) *
      intervalDays *
      DAY_MS;

  while (
    cursor < periodStart
  ) {
    cursor +=
      intervalDays *
      DAY_MS;
  }

  const dates: string[] = [];

  while (
    cursor < periodEnd
  ) {
    const date =
      new Date(cursor);

    dates.push(
      isoDate(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate()
      )
    );

    cursor +=
      intervalDays *
      DAY_MS;
  }

  return dates;
}

function parsePeriodKey(
  periodKey: string
): {
  year: number;
  month: number;
} {
  const match =
    periodKey.match(
      /^(\d{4})-(\d{2})$/
    );

  if (!match) {
    throw new Error(
      "Income period must use YYYY-MM."
    );
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  if (
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      "Income period is not valid."
    );
  }

  return {
    year,
    month
  };
}

function parseIsoDate(
  value: string
): Date {
  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    throw new Error(
      "Payday must use YYYY-MM-DD."
    );
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    throw new Error(
      "Payday is not a valid date."
    );
  }

  return date;
}

function clampDay(
  year: number,
  month: number,
  requestedDay: number
): number {
  const lastDay =
    new Date(
      Date.UTC(
        year,
        month,
        0
      )
    ).getUTCDate();

  return Math.min(
    Math.max(
      requestedDay,
      1
    ),
    lastDay
  );
}

function isoDate(
  year: number,
  month: number,
  day: number
): string {
  return [
    String(year).padStart(
      4,
      "0"
    ),
    String(month).padStart(
      2,
      "0"
    ),
    String(day).padStart(
      2,
      "0"
    )
  ].join("-");
}
