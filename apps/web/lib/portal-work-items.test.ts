import { describe, expect, it } from "vitest";
import {
  buildPortalWorkSummaryCounts,
  getPortalWorkDueLabel,
  getPortalWorkItemTypeLabel,
  getPortalWorkStatusBucket
} from "./portal-work-items";

describe("portal work item helpers", () => {
  it("maps internal object types to client-facing labels", () => {
    expect(getPortalWorkItemTypeLabel("Transaction")).toBe("Transaction Support");
    expect(getPortalWorkItemTypeLabel("ShowingRequest")).toBe("Showing Request");
    expect(getPortalWorkItemTypeLabel("BillingSetupRequest")).toBe("Billing Setup");
  });

  it("groups statuses into client dashboard buckets", () => {
    expect(getPortalWorkStatusBucket("Waiting on Client")).toBe("waiting");
    expect(getPortalWorkStatusBucket("Ready for Client Review")).toBe("review");
    expect(getPortalWorkStatusBucket("Completed")).toBe("completed");
    expect(getPortalWorkStatusBucket("Active")).toBe("active");
  });

  it("extracts the most helpful due label from work item metadata", () => {
    expect(getPortalWorkDueLabel({ dueLabel: "Today", dueAt: "2026-07-30" })).toBe("Today");
    expect(getPortalWorkDueLabel({ closeDate: "Aug 12" })).toBe("Aug 12");
    expect(getPortalWorkDueLabel({ preferredWindow: "Thursday afternoon" })).toBe(
      "Thursday afternoon"
    );
    expect(getPortalWorkDueLabel({})).toBe("Date pending");
  });

  it("builds summary counts from work item statuses", () => {
    expect(
      buildPortalWorkSummaryCounts([
        { status: "Waiting on Client" },
        { status: "Ready for Review" },
        { status: "Active" },
        { status: "Complete" }
      ])
    ).toEqual({
      active: 1,
      completed: 1,
      review: 1,
      waiting: 1
    });
  });
});
