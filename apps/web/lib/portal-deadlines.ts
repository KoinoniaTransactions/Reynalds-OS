export type PortalDeadlineRisk =
  | "overdue"
  | "due_today"
  | "due_soon"
  | "upcoming";

export type PortalDeadlinePriority = "high" | "medium" | "low";

export type PortalTransactionDeadline = {
  date: Date;
  dateLabel: string;
  daysUntilDue: number;
  key: string;
  label: string;
  risk: PortalDeadlineRisk;
};

export type PortalDeadlineAction = {
  deadlineKey: string;
  detail: string;
  id: string;
  label: string;
  priority: PortalDeadlinePriority;
  risk: PortalDeadlineRisk;
};

type PortalDeadlineDefinition = {
  aliases?: readonly string[];
  key: string;
  label: string;
  warningDays: number;
};

const portalDeadlineDefinitions: readonly PortalDeadlineDefinition[] = [
  {
    key: "contractDate",
    label: "Contract Date",
    warningDays: 0
  },
  {
    aliases: ["earnestMoneyDueDate"],
    key: "earnestMoneyDeadline",
    label: "Earnest Money",
    warningDays: 2
  },
  {
    aliases: ["inspectionObjectionDate"],
    key: "inspectionObjectionDeadline",
    label: "Inspection Objection",
    warningDays: 2
  },
  {
    aliases: ["inspectionResolutionDate"],
    key: "inspectionResolutionDeadline",
    label: "Inspection Resolution",
    warningDays: 2
  },
  {
    aliases: ["titleDate"],
    key: "titleDeadline",
    label: "Title",
    warningDays: 3
  },
  {
    aliases: ["hoaDate", "associationDocumentsDeadline"],
    key: "hoaDeadline",
    label: "HOA Documents",
    warningDays: 3
  },
  {
    aliases: ["appraisalDate"],
    key: "appraisalDeadline",
    label: "Appraisal",
    warningDays: 3
  },
  {
    aliases: ["loanObjectionDate"],
    key: "loanObjectionDeadline",
    label: "Loan Objection",
    warningDays: 3
  },
  {
    aliases: ["closeDate"],
    key: "closingDate",
    label: "Closing",
    warningDays: 7
  },
  {
    aliases: ["possessionDeadline"],
    key: "possessionDate",
    label: "Possession",
    warningDays: 3
  }
];

export function getTransactionDeadlines(
  data: unknown,
  now = new Date()
): PortalTransactionDeadline[] {
  const record = toRecord(data);
  const nestedDeadlines = toRecord(record.deadlines);
  const today = startOfUtcDay(now);

  return portalDeadlineDefinitions
    .flatMap((definition) => {
      const rawValue = getDeadlineValue(
        record,
        nestedDeadlines,
        definition
      );
      const date = parsePortalDeadlineDate(rawValue);

      if (!date) {
        return [];
      }

      const daysUntilDue = differenceInUtcDays(date, today);

      return [
        {
          date,
          dateLabel: formatPortalDeadlineDate(date),
          daysUntilDue,
          key: definition.key,
          label: definition.label,
          risk: getDeadlineRisk(
            daysUntilDue,
            definition.warningDays
          )
        }
      ];
    })
    .sort(
      (left, right) =>
        left.date.getTime() - right.date.getTime()
    );
}

export function buildDeadlineActions(
  deadlines: readonly PortalTransactionDeadline[],
  options: {
    upcomingWindowDays?: number;
  } = {}
): PortalDeadlineAction[] {
  const upcomingWindowDays = options.upcomingWindowDays ?? 14;

  return deadlines
    .filter(
      (deadline) =>
        deadline.risk !== "upcoming" ||
        deadline.daysUntilDue <= upcomingWindowDays
    )
    .map((deadline) => ({
      deadlineKey: deadline.key,
      detail: getDeadlineActionDetail(deadline),
      id: `deadline-${deadline.key}`,
      label: getDeadlineActionLabel(deadline),
      priority: getDeadlinePriority(deadline.risk),
      risk: deadline.risk
    }));
}

export function getDeadlineRisk(
  daysUntilDue: number,
  warningDays: number
): PortalDeadlineRisk {
  if (daysUntilDue < 0) {
    return "overdue";
  }

  if (daysUntilDue === 0) {
    return "due_today";
  }

  if (daysUntilDue <= warningDays) {
    return "due_soon";
  }

  return "upcoming";
}

function getDeadlineValue(
  record: Record<string, unknown>,
  nestedDeadlines: Record<string, unknown>,
  definition: PortalDeadlineDefinition
): unknown {
  const keys = [definition.key, ...(definition.aliases ?? [])];

  for (const key of keys) {
    const nestedValue = nestedDeadlines[key];

    if (hasDeadlineValue(nestedValue)) {
      return nestedValue;
    }

    const topLevelValue = record[key];

    if (hasDeadlineValue(topLevelValue)) {
      return topLevelValue;
    }
  }

  return null;
}

function hasDeadlineValue(value: unknown): boolean {
  return (
    value instanceof Date ||
    (typeof value === "string" && Boolean(value.trim()))
  );
}

function parsePortalDeadlineDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : startOfUtcDay(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();

  if (!text) {
    return null;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);

  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      return null;
    }

    return parsed;
  }

  const parsed = new Date(text);

  return Number.isNaN(parsed.getTime())
    ? null
    : startOfUtcDay(parsed);
}

function differenceInUtcDays(date: Date, today: Date): number {
  return Math.round(
    (startOfUtcDay(date).getTime() - today.getTime()) /
      (24 * 60 * 60 * 1000)
  );
}

function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate()
    )
  );
}

function formatPortalDeadlineDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  });
}

function getDeadlinePriority(
  risk: PortalDeadlineRisk
): PortalDeadlinePriority {
  switch (risk) {
    case "overdue":
    case "due_today":
      return "high";
    case "due_soon":
      return "medium";
    default:
      return "low";
  }
}

function getDeadlineActionLabel(
  deadline: PortalTransactionDeadline
): string {
  switch (deadline.risk) {
    case "overdue":
      return `${deadline.label} is overdue`;
    case "due_today":
      return `${deadline.label} is due today`;
    case "due_soon":
      return `${deadline.label} is due soon`;
    default:
      return `${deadline.label} is upcoming`;
  }
}

function getDeadlineActionDetail(
  deadline: PortalTransactionDeadline
): string {
  if (deadline.risk === "overdue") {
    const overdueDays = Math.abs(deadline.daysUntilDue);

    return `${deadline.label} was due ${deadline.dateLabel} and is ${overdueDays} day${
      overdueDays === 1 ? "" : "s"
    } overdue.`;
  }

  if (deadline.risk === "due_today") {
    return `${deadline.label} is due today, ${deadline.dateLabel}.`;
  }

  return `${deadline.label} is due ${deadline.dateLabel}, in ${
    deadline.daysUntilDue
  } day${deadline.daysUntilDue === 1 ? "" : "s"}.`;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
