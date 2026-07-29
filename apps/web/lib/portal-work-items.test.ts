import { describe, expect, it } from "vitest";
import {
  buildPortalWorkSummaryCounts,
  getPortalWorkDueLabel,
  getPortalWorkItemTypeLabel,
  getPortalWorkStatusBucket,
  isClientPortalWorkObjectType,
  PortalWorkAssignmentValidationError,
  validatePortalWorkAssignmentInput
} from "./portal-work-items";

describe("portal work item helpers", () => {
  it("maps internal object types to client-facing labels", () => {
    expect(getPortalWorkItemTypeLabel("Transaction")).toBe("Transaction Support");
    expect(getPortalWorkItemTypeLabel("ShowingRequest")).toBe("Showing Request");
    expect(getPortalWorkItemTypeLabel("BillingSetupRequest")).toBe("Billing Setup");
    expect(isClientPortalWorkObjectType("Transaction")).toBe(true);
    expect(isClientPortalWorkObjectType("PortalLaunchProof")).toBe(false);
  });

  it("groups statuses into client dashboard buckets", () => {
    expect(getPortalWorkStatusBucket("Waiting on Client")).toBe("waiting");
    expect(getPortalWorkStatusBucket("Consent Needed")).toBe("waiting");
    expect(getPortalWorkStatusBucket("Ready for Client Review")).toBe("review");
    expect(getPortalWorkStatusBucket("Completed")).toBe("completed");
    expect(getPortalWorkStatusBucket("Superseded")).toBe("completed");
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

  it("validates safe work assignment updates", () => {
    expect(
      validatePortalWorkAssignmentInput({
        assignedStaffUserId: "usr_staff_primary",
        assignmentNote: "Assigned for transaction deadline tracking and next client update.",
        backupStaffUserId: "usr_staff_backup"
      })
    ).toEqual({
      assignedStaffUserId: "usr_staff_primary",
      assignmentNote: "Assigned for transaction deadline tracking and next client update.",
      backupStaffUserId: "usr_staff_backup"
    });
  });

  it("requires a primary owner or an unassigned explanation", () => {
    expect(() =>
      validatePortalWorkAssignmentInput({
        assignedStaffUserId: "",
        backupStaffUserId: ""
      })
    ).toThrow(PortalWorkAssignmentValidationError);
  });

  it("rejects the same person as primary and backup", () => {
    expect(() =>
      validatePortalWorkAssignmentInput({
        assignedStaffUserId: "usr_staff_primary",
        backupStaffUserId: "usr_staff_primary"
      })
    ).toThrow("Primary and backup staff must be different people.");
  });

  it("rejects sensitive assignment notes", () => {
    expect(() =>
      validatePortalWorkAssignmentInput({
        assignedStaffUserId: "usr_staff_primary",
        assignmentNote: "Client sent the MLS password and brokerage password here.",
        backupStaffUserId: ""
      })
    ).toThrow("Do not include passwords");
  });
});
