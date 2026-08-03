import { describe, expect, it } from "vitest";
import { getTransactionDeadlines } from "./portal-deadlines";
import {
  calculatePortalTransactionHealth,
  getPortalTransactionHealthStatus
} from "./portal-transaction-health";

describe("portal transaction health", () => {
  const now = new Date("2026-08-03T15:00:00.000Z");

  it("returns a healthy score when operational signals are clear", () => {
    const health = calculatePortalTransactionHealth({
      activeDocumentCount: 4,
      assignedStaffUserId: "user_primary",
      backupStaffUserId: "user_backup",
      deadlines: getTransactionDeadlines(
        {
          closingDate: "2026-08-20"
        },
        now
      ),
      missingExpectedDocumentCount: 0,
      outstandingDocumentActionCount: 0,
      recentActivityCount: 5
    });

    expect(health).toMatchObject({
      score: 100,
      status: "healthy",
      statusLabel: "Healthy"
    });

    expect(
      health.factors.every((factor) => factor.state === "positive")
    ).toBe(true);
  });

  it("reduces health for missing ownership and workflow coverage", () => {
    const health = calculatePortalTransactionHealth({
      activeDocumentCount: 0,
      assignedStaffUserId: null,
      backupStaffUserId: null,
      deadlines: [],
      missingExpectedDocumentCount: 2,
      outstandingDocumentActionCount: 2,
      recentActivityCount: 0
    });

    expect(health.score).toBe(25);
    expect(health.status).toBe("at_risk");

    expect(health.factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "primary_staff",
          penalty: 25,
          state: "critical"
        }),
        expect.objectContaining({
          key: "backup_staff",
          penalty: 10,
          state: "warning"
        }),
        expect.objectContaining({
          key: "missing_documents",
          penalty: 10
        })
      ])
    );
  });

  it("applies deadline penalties based on risk", () => {
    const health = calculatePortalTransactionHealth({
      activeDocumentCount: 3,
      assignedStaffUserId: "user_primary",
      backupStaffUserId: "user_backup",
      deadlines: getTransactionDeadlines(
        {
          earnestMoneyDeadline: "2026-08-01",
          inspectionObjectionDeadline: "2026-08-03",
          inspectionResolutionDeadline: "2026-08-05",
          closingDate: "2026-08-20"
        },
        now
      ),
      missingExpectedDocumentCount: 0,
      outstandingDocumentActionCount: 0,
      recentActivityCount: 3
    });

    expect(health.score).toBe(65);
    expect(health.status).toBe("watch");

    expect(health.factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "overdue_deadlines",
          penalty: 20,
          state: "critical"
        }),
        expect.objectContaining({
          key: "due_today_deadlines",
          penalty: 10,
          state: "critical"
        }),
        expect.objectContaining({
          key: "due_soon_deadlines",
          penalty: 5,
          state: "warning"
        })
      ])
    );
  });

  it("caps repeated penalties and never returns a negative score", () => {
    const deadlines = getTransactionDeadlines(
      {
        contractDate: "2026-07-01",
        earnestMoneyDeadline: "2026-07-02",
        inspectionObjectionDeadline: "2026-07-03",
        inspectionResolutionDeadline: "2026-07-04",
        titleDeadline: "2026-07-05",
        appraisalDeadline: "2026-07-06"
      },
      now
    );

    const health = calculatePortalTransactionHealth({
      activeDocumentCount: 0,
      assignedStaffUserId: null,
      backupStaffUserId: null,
      deadlines,
      missingExpectedDocumentCount: 20,
      outstandingDocumentActionCount: 20,
      recentActivityCount: 0
    });

    expect(health.score).toBe(0);
    expect(health.status).toBe("at_risk");

    expect(
      health.factors.find(
        (factor) => factor.key === "overdue_deadlines"
      )?.penalty
    ).toBe(40);
  });

  it("classifies score thresholds consistently", () => {
    expect(getPortalTransactionHealthStatus(100)).toBe("healthy");
    expect(getPortalTransactionHealthStatus(85)).toBe("healthy");
    expect(getPortalTransactionHealthStatus(84)).toBe("watch");
    expect(getPortalTransactionHealthStatus(65)).toBe("watch");
    expect(getPortalTransactionHealthStatus(64)).toBe("at_risk");
    expect(getPortalTransactionHealthStatus(0)).toBe("at_risk");
  });
});
