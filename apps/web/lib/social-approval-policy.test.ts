import { describe, expect, it } from "vitest";
import { mayApproveSocialVariant } from "./social-approval-policy";

describe("social self approval", () => {
  it("allows explicit owner self approval", () => {
    expect(mayApproveSocialVariant({ actorRole: "Owner", actorId: "a", creatorId: "a", ownerSelfApprovalAcknowledged: true })).toBe(true);
  });
  it("rejects implicit owner self approval", () => {
    expect(mayApproveSocialVariant({ actorRole: "Owner", actorId: "a", creatorId: "a", ownerSelfApprovalAcknowledged: false })).toBe(false);
  });
  it("forbids self approval by admin and staff, even if requested", () => {
    for (const role of ["Admin", "Employee", "Staff"]) expect(mayApproveSocialVariant({ actorRole: role, actorId: "a", creatorId: "a", ownerSelfApprovalAcknowledged: true })).toBe(false);
  });
  it("allows an independent owner or admin reviewer but not staff", () => {
    for (const role of ["Owner", "Admin"]) expect(mayApproveSocialVariant({ actorRole: role, actorId: "a", creatorId: "b", ownerSelfApprovalAcknowledged: false })).toBe(true);
    expect(mayApproveSocialVariant({ actorRole: "Employee", actorId: "a", creatorId: "b", ownerSelfApprovalAcknowledged: true })).toBe(false);
  });
});
