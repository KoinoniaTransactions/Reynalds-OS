import { describe, expect, it } from "vitest";
import {
  buildDeadlineActions,
  getDeadlineRisk,
  getTransactionDeadlines,
  resolvePortalPlaybookDeadlines
} from "./portal-deadlines";

describe("portal transaction deadlines", () => {
  const now = new Date("2026-08-03T15:00:00.000Z");

  it("extracts and sorts explicit transaction deadline dates", () => {
    const deadlines = getTransactionDeadlines(
      {
        closingDate: "2026-08-20",
        earnestMoneyDeadline: "2026-08-04",
        inspectionObjectionDeadline: "2026-08-06"
      },
      now
    );

    expect(
      deadlines.map((deadline) => deadline.key)
    ).toEqual([
      "earnestMoneyDeadline",
      "inspectionObjectionDeadline",
      "closingDate"
    ]);

    expect(deadlines[0]).toMatchObject({
      dateLabel: "Aug 4, 2026",
      daysUntilDue: 1,
      label: "Earnest Money",
      risk: "due_soon"
    });
  });

  it("reads nested deadline values and supported aliases", () => {
    const deadlines = getTransactionDeadlines(
      {
        deadlines: {
          closeDate: "2026-08-17",
          loanObjectionDate: "2026-08-03"
        }
      },
      now
    );

    expect(deadlines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "loanObjectionDeadline",
          risk: "due_today"
        }),
        expect.objectContaining({
          key: "closingDate",
          daysUntilDue: 14
        })
      ])
    );
  });

  it("ignores invalid or absent deadline values", () => {
    const deadlines = getTransactionDeadlines(
      {
        closingDate: "not-a-date",
        inspectionResolutionDeadline: "",
        deadlineSummary: "Inspection dates are still being confirmed."
      },
      now
    );

    expect(deadlines).toEqual([]);
  });

  it("classifies deadline risk from entered dates", () => {
    expect(getDeadlineRisk(-1, 3)).toBe("overdue");
    expect(getDeadlineRisk(0, 3)).toBe("due_today");
    expect(getDeadlineRisk(2, 3)).toBe("due_soon");
    expect(getDeadlineRisk(8, 3)).toBe("upcoming");
  });

  it("builds queue-ready deadline actions", () => {
    const actions = buildDeadlineActions(
      getTransactionDeadlines(
        {
          earnestMoneyDeadline: "2026-08-01",
          inspectionObjectionDeadline: "2026-08-03",
          inspectionResolutionDeadline: "2026-08-05",
          closingDate: "2026-08-17",
          possessionDate: "2026-09-01"
        },
        now
      )
    );

    expect(actions).toEqual([
      expect.objectContaining({
        deadlineKey: "earnestMoneyDeadline",
        label: "Earnest Money is overdue",
        priority: "high",
        risk: "overdue"
      }),
      expect.objectContaining({
        deadlineKey: "inspectionObjectionDeadline",
        label: "Inspection Objection is due today",
        priority: "high",
        risk: "due_today"
      }),
      expect.objectContaining({
        deadlineKey: "inspectionResolutionDeadline",
        label: "Inspection Resolution is due soon",
        priority: "medium",
        risk: "due_soon"
      }),
      expect.objectContaining({
        deadlineKey: "closingDate",
        label: "Closing is upcoming",
        priority: "low",
        risk: "upcoming"
      })
    ]);
  });

  it("does not surface distant upcoming dates by default", () => {
    const actions = buildDeadlineActions(
      getTransactionDeadlines(
        {
          closingDate: "2026-09-15"
        },
        now
      )
    );

    expect(actions).toEqual([]);
  });
});

describe("portal deadline completion", () => {
  it("excludes completed deadlines from active deadline results", () => {
    const deadlines = getTransactionDeadlines(
      {
        earnestMoneyDeadline: "2026-08-04",
        inspectionObjectionDeadline: "2026-08-06",
        completedDeadlines: {
          earnestMoneyDeadline: {
            completedAt: "2026-08-03T18:00:00.000Z",
            completedByUserId: "user_1",
            note: "Receipt confirmed."
          }
        }
      },
      new Date("2026-08-03T15:00:00.000Z")
    );

    expect(deadlines.map((deadline) => deadline.key)).toEqual([
      "inspectionObjectionDeadline"
    ]);
  });
});

describe("persisted playbook deadline resolution", () => {
  it("recalculates persisted deadline urgency using the current date", () => {
    const deadlines = resolvePortalPlaybookDeadlines({
      data: {},
      now: new Date("2026-08-03T15:00:00.000Z"),
      persistedDeadlines: [
        {
          date: new Date("2026-08-05T00:00:00.000Z"),
          dateLabel: "August 5, 2026",
          daysUntilDue: 30,
          key: "closingDate",
          label: "Closing",
          risk: "upcoming"
        }
      ]
    });

    expect(deadlines[0]).toMatchObject({
      daysUntilDue: 2,
      key: "closingDate",
      risk: "due_soon"
    });
  });

  it("removes completed persisted deadlines", () => {
    const deadlines = resolvePortalPlaybookDeadlines({
      data: {
        completedDeadlines: {
          closingDate: {
            completedAt: "2026-08-02T18:00:00.000Z"
          }
        }
      },
      now: new Date("2026-08-03T15:00:00.000Z"),
      persistedDeadlines: [
        {
          date: new Date("2026-08-05T00:00:00.000Z"),
          dateLabel: "August 5, 2026",
          daysUntilDue: 2,
          key: "closingDate",
          label: "Closing",
          risk: "due_soon"
        }
      ]
    });

    expect(deadlines).toEqual([]);
  });

  it("falls back to raw work-item dates for legacy records", () => {
    const deadlines = resolvePortalPlaybookDeadlines({
      data: {
        closingDate: "2026-08-10"
      },
      now: new Date("2026-08-03T15:00:00.000Z")
    });

    expect(deadlines).toHaveLength(1);
    expect(deadlines[0]?.key).toBe("closingDate");
  });
});
