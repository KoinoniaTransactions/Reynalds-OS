import { createAuthUser } from "@reynalds-os/auth";
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";
import {
  getClerkDatabaseUserWhere,
  getMockAuthUser,
  getPortalInvitationAcceptanceWhere,
  normalizeClerkEmailAddress
} from "./auth";

describe("Clerk email normalization", () => {
  it("normalizes mixed-case Clerk emails for invitation matching", () => {
    expect(normalizeClerkEmailAddress("  JeremiahReynalds@GMAIL.COM  ")).toBe(
      "jeremiahreynalds@gmail.com"
    );
  });
});

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

describe("mock auth workspace isolation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates different Client identities for Koinonia and Reynalds Brothers", () => {
    vi.stubEnv(
      "ROS_MOCK_USER_ROLE",
      "Client"
    );

    vi.stubEnv(
      "ROS_MOCK_WORKSPACE_ID",
      "wks_koinonia"
    );

    const koinoniaClient =
      getMockAuthUser();

    vi.stubEnv(
      "ROS_MOCK_WORKSPACE_ID",
      "wks_reynalds_brothers"
    );

    const reynaldsBrothersClient =
      getMockAuthUser();

    expect(
      koinoniaClient.id
    ).toBe(
      "usr_mock_wks_koinonia_client"
    );

    expect(
      reynaldsBrothersClient.id
    ).toBe(
      "usr_mock_wks_reynalds_brothers_client"
    );

    expect(
      koinoniaClient.id
    ).not.toBe(
      reynaldsBrothersClient.id
    );
  });

  it("keeps Koinonia Owner mapped to its seeded user while isolating another workspace", () => {
    vi.stubEnv(
      "ROS_MOCK_USER_ROLE",
      "Owner"
    );

    vi.stubEnv(
      "ROS_MOCK_WORKSPACE_ID",
      "wks_koinonia"
    );

    const koinoniaOwner =
      getMockAuthUser();

    vi.stubEnv(
      "ROS_MOCK_WORKSPACE_ID",
      "wks_reynalds_brothers"
    );

    const reynaldsBrothersOwner =
      getMockAuthUser();

    expect(
      koinoniaOwner.id
    ).toBe(
      "usr_owner"
    );

    expect(
      reynaldsBrothersOwner.id
    ).toBe(
      "usr_mock_wks_reynalds_brothers_owner"
    );

    expect(
      koinoniaOwner.id
    ).not.toBe(
      reynaldsBrothersOwner.id
    );
  });
});
