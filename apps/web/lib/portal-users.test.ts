import { describe, expect, it } from "vitest";
import { getPortalUserDeactivationBlocker } from "./portal-users";

describe("portal user access", () => {
  it("blocks self-deactivation", () => {
    expect(
      getPortalUserDeactivationBlocker({
        actorUserId: "usr_owner",
        targetUserId: "usr_owner",
        status: "active",
        portalAccessStatus: "active"
      })
    ).toBe("You cannot deactivate your own portal access.");
  });

  it("treats inactive users as already inactive", () => {
    expect(
      getPortalUserDeactivationBlocker({
        actorUserId: "usr_owner",
        targetUserId: "usr_client",
        status: "inactive",
        portalAccessStatus: "active"
      })
    ).toBe("Portal user access is already inactive.");
  });

  it("allows active target users to be deactivated by another admin", () => {
    expect(
      getPortalUserDeactivationBlocker({
        actorUserId: "usr_owner",
        targetUserId: "usr_client",
        status: "active",
        portalAccessStatus: "active"
      })
    ).toBeNull();
  });
});
