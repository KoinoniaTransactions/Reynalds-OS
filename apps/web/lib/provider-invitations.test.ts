import { describe, expect, it } from "vitest";
import { buildClerkInvitationParams } from "./provider-invitations";

describe("provider invitations", () => {
  it("builds Clerk invitation params with Koinonia role and workspace metadata", () => {
    expect(
      buildClerkInvitationParams({
        email: "client@example.com",
        invitedByUserId: "usr_owner",
        roleName: "Client",
        workspaceId: "wks_koinonia",
        name: "Client User",
        clientObjectId: "obj_client",
        serviceContext: { package: "Transaction Coordination Plus" },
        redirectUrl: "/sign-in"
      })
    ).toEqual({
      emailAddress: "client@example.com",
      redirectUrl: "/sign-in",
      publicMetadata: {
        koinoniaRole: "Client",
        koinoniaWorkspaceId: "wks_koinonia",
        koinoniaInvitationName: "Client User",
        koinoniaInvitedByUserId: "usr_owner",
        koinoniaClientObjectId: "obj_client",
        koinoniaServiceContext: { package: "Transaction Coordination Plus" }
      }
    });
  });

  it("uses the sign-in page when no redirect is supplied", () => {
    expect(
      buildClerkInvitationParams({
        email: "staff@example.com",
        invitedByUserId: "usr_owner",
        roleName: "Operations",
        workspaceId: "wks_koinonia"
      })
    ).toMatchObject({
      emailAddress: "staff@example.com",
      redirectUrl: "/sign-in",
      publicMetadata: {
        koinoniaRole: "Operations",
        koinoniaWorkspaceId: "wks_koinonia"
      }
    });
  });
});
