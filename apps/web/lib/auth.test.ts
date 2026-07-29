import { createAuthUser } from "@reynalds-os/auth";
import { describe, expect, it } from "vitest";
import { getClerkDatabaseUserWhere, getPortalInvitationAcceptanceWhere } from "./auth";

describe("managed auth matching", () => {
  const providerUser = createAuthUser({
    id: "clerk_user_123",
    workspaceId: "wks_koinonia",
    name: "Koinonia Client",
    email: "client@example.com",
    role: "Client"
  });

  it("scopes email fallback user matching to the provider workspace", () => {
    expect(getClerkDatabaseUserWhere(providerUser)).toEqual({
      OR: [
        {
          authProvider: "clerk",
          authProviderUserId: "clerk_user_123"
        },
        {
          workspaceId: "wks_koinonia",
          email: "client@example.com"
        }
      ]
    });
  });

  it("scopes provider invitation acceptance to the provider workspace", () => {
    const now = new Date("2026-07-29T12:00:00.000Z");

    expect(getPortalInvitationAcceptanceWhere(providerUser, now)).toEqual({
      provider: "clerk",
      workspaceId: "wks_koinonia",
      email: "client@example.com",
      revokedAt: null,
      status: { in: ["pending", "provider_pending"] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
    });
  });
});
