import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  workspace: {
    findUnique: vi.fn()
  },
  role: {
    findMany: vi.fn()
  },
  user: {
    findMany: vi.fn()
  },
  portalInvitation: {
    findMany: vi.fn()
  }
}));

vi.mock("./db", () => ({
  prisma: prismaMock
}));

import { getPortalDatabaseReadiness } from "./portal-readiness-runtime";

describe("portal readiness runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    prismaMock.workspace.findUnique.mockResolvedValue({
      id: "wks_koinonia"
    });
    prismaMock.role.findMany.mockResolvedValue([]);
    prismaMock.portalInvitation.findMany.mockResolvedValue([]);
  });

  it("derives active Clerk-linked client and staff user counts from database users", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        authProvider: "clerk",
        authProviderUserId: "user_client_1",
        mfaRequired: false,
        portalAccessStatus: "active",
        role: {
          name: "Client"
        }
      },
      {
        authProvider: "clerk",
        authProviderUserId: "user_staff_1",
        mfaRequired: true,
        portalAccessStatus: "active",
        role: {
          name: "Operations"
        }
      },
      {
        authProvider: "clerk",
        authProviderUserId: "",
        mfaRequired: false,
        portalAccessStatus: "active",
        role: {
          name: "Client"
        }
      },
      {
        authProvider: "clerk",
        authProviderUserId: "user_staff_inactive_portal",
        mfaRequired: true,
        portalAccessStatus: "disabled",
        role: {
          name: "Finance"
        }
      },
      {
        authProvider: "other-provider",
        authProviderUserId: "other_staff_user",
        mfaRequired: true,
        portalAccessStatus: "active",
        role: {
          name: "Transaction Coordinator"
        }
      }
    ]);

    const readiness = await getPortalDatabaseReadiness("wks_koinonia");

    expect(readiness.connected).toBe(true);
    expect(readiness.activeClientClerkUserCount).toBe(1);
    expect(readiness.activeStaffClerkUserCount).toBe(1);

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: {
        workspaceId: "wks_koinonia",
        status: "active"
      },
      select: {
        authProvider: true,
        authProviderUserId: true,
        mfaRequired: true,
        portalAccessStatus: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
  });

  it("returns disconnected readiness when the database check fails", async () => {
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error("database unavailable"));

    const readiness = await getPortalDatabaseReadiness("wks_koinonia");

    expect(readiness).toEqual({
      connected: false,
      detail: "Database readiness check failed."
    });
  });
});
