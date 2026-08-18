import { describe, expect, it } from "vitest";
import {
  getAccessSummaryCounts,
  getHumanInvitationStatus,
  getHumanPortalAccessStatus,
  getMfaLabel,
  getServiceContextText,
  isStaffPortalUser
} from "./portal-access-workspace";

describe("portal access workspace helpers", () => {
  it("summarizes invitation and user access states", () => {
    expect(
      getAccessSummaryCounts(
        [
          { mfaRequired: true, portalAccessStatus: "active", roleName: "Owner", status: "active" },
          { mfaRequired: false, portalAccessStatus: "active", roleName: "Client", status: "active" },
          { mfaRequired: true, portalAccessStatus: "deactivated", roleName: "Operations", status: "active" }
        ],
        [{ status: "pending" }, { status: "provider_error" }, { status: "accepted" }]
      )
    ).toEqual({
      activeAccess: 2,
      blockedAccess: 2,
      mfaRequired: 1,
      pendingInvitations: 2
    });
  });

  it("formats provider and portal statuses for staff", () => {
    expect(getHumanInvitationStatus("provider_pending")).toBe("Invite Sent");
    expect(getHumanInvitationStatus("provider_error")).toBe("Send Review");
    expect(getHumanPortalAccessStatus("active", "deactivated")).toBe("Deactivated");
    expect(getHumanPortalAccessStatus("inactive", "active")).toBe("Inactive");
  });

  it("separates staff users from client users", () => {
    expect(isStaffPortalUser({ mfaRequired: true, portalAccessStatus: "active", roleName: "Owner", status: "active" })).toBe(
      true
    );
    expect(isStaffPortalUser({ mfaRequired: false, portalAccessStatus: "active", roleName: "Client", status: "active" })).toBe(
      false
    );
  });

  it("marks missing staff MFA as a review item", () => {
    expect(getMfaLabel({ mfaRequired: true, portalAccessStatus: "active", roleName: "Operations", status: "active" })).toBe(
      "Required"
    );
    expect(getMfaLabel({ mfaRequired: false, portalAccessStatus: "active", roleName: "Operations", status: "active" })).toBe(
      "Needs Review"
    );
    expect(getMfaLabel({ mfaRequired: false, portalAccessStatus: "active", roleName: "Client", status: "active" })).toBe(
      "Client Optional"
    );
  });

  it("reads safe display text from service context", () => {
    expect(getServiceContextText({ packageName: "Transaction Plus" }, ["packageName", "service"], "Unassigned")).toBe(
      "Transaction Plus"
    );
    expect(getServiceContextText(["unexpected"], ["packageName"], "Unassigned")).toBe("Unassigned");
  });
});
