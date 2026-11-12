import { NextRequest } from "next/server";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  tx: { socialChannelConnection: { upsert: vi.fn() }, socialConnectionVault: { upsert: vi.fn() }, auditEvent: { create: vi.fn() } },
  db: { socialAuthorization: { findUnique: vi.fn(), updateMany: vi.fn() }, $transaction: vi.fn() },
  actor: { id: "owner", workspaceId: "w1", role: "Owner" }, fetch: vi.fn()
}));
vi.mock("../../../../../../../lib/auth", () => ({ getAuthProvider: () => "clerk", assertPermission: async () => mocks.actor }));
vi.mock("../../../../../../../lib/api-auth", () => ({ getAuthErrorResponse: () => null }));
vi.mock("../../../../../../../lib/db", () => ({ prisma: mocks.db }));
vi.mock("../../../../../../../lib/social-connection-vault", () => ({ sealSocialConnection: () => "encrypted-envelope" }));
import { GET } from "./route";
const callback = "https://www.koinoniatransactions.com/api/employee/social/oauth/meta/callback";
function request(params = "state=nonce&code=code") { return new NextRequest(callback + "?" + params, { headers: { cookie: "koinonia_meta_oauth_state=nonce" } }); }
const scopes = ["pages_show_list", "pages_manage_posts", "pages_read_engagement", "instagram_basic", "instagram_content_publish"];
function reply(value: unknown) { return new Response(JSON.stringify(value), { status: 200 }); }
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("fetch", mocks.fetch); vi.spyOn(console, "error").mockImplementation(() => {});
  for (const [key, value] of Object.entries({ META_APP_ID: "123", META_APP_SECRET: "fake-secret", META_BUSINESS_LOGIN_CONFIG_ID: "456", SOCIAL_META_CALLBACK_URL: callback, SOCIAL_CONNECTION_VAULT_KEY: "fake-key", SOCIAL_META_OAUTH_ENABLED: "true" })) vi.stubEnv(key, value);
  mocks.actor.role = "Owner";
  mocks.db.socialAuthorization.findUnique.mockResolvedValue({ id: "auth1", status: "pending", expiresAt: new Date(Date.now() + 60000), workspaceId: "w1", actorId: "owner", platform: "meta" });
  mocks.db.socialAuthorization.updateMany.mockResolvedValue({ count: 1 });
  mocks.db.$transaction.mockImplementation(async (fn: (tx: typeof mocks.tx) => unknown) => fn(mocks.tx));
  mocks.tx.socialChannelConnection.upsert.mockResolvedValue({ id: "c1" });
  mocks.fetch.mockReset().mockResolvedValueOnce(reply({ access_token: "test-user-token" }))
    .mockResolvedValueOnce(reply({ data: { is_valid: true, app_id: "123", scopes } }))
    .mockResolvedValueOnce(reply({ data: [{ id: "101", name: "Page", access_token: "test-page-token" }] }))
    .mockResolvedValueOnce(reply({ data: { is_valid: true, app_id: "123", scopes, profile_id: "101" } }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("Meta callback security boundary", () => {
  it("persists verified Page credentials and connection together in one transaction", async () => {
    const response = await GET(request());
    expect(response.headers.get("location")).toContain("meta=connected");
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1);
    expect(mocks.tx.socialChannelConnection.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ workspaceId: "w1", status: "connected", providerAccountId: "101" }) }));
    expect(mocks.tx.socialConnectionVault.upsert).toHaveBeenCalledTimes(1);
  });
  it("rejects replayed state before calling the provider", async () => {
    mocks.db.socialAuthorization.updateMany.mockResolvedValue({ count: 0 });
    expect((await GET(request())).headers.get("location")).toContain("meta=invalid"); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("rejects a cross-workspace state and a mismatched cookie", async () => {
    mocks.db.socialAuthorization.findUnique.mockResolvedValue({ workspaceId: "other" });
    expect((await GET(request())).headers.get("location")).toContain("meta=invalid");
    expect((await GET(request("state=wrong&code=code"))).headers.get("location")).toContain("meta=invalid"); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("consumes declined grants without provider traffic", async () => {
    expect((await GET(request("state=nonce&error=access_denied"))).headers.get("location")).toContain("meta=denied");
    expect(mocks.db.socialAuthorization.updateMany).toHaveBeenCalled(); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it("never stores an unverified Page grant or logs provider messages", async () => {
    mocks.fetch.mockReset().mockResolvedValueOnce(reply({ access_token: "test-user-token" }))
      .mockResolvedValueOnce(reply({ data: { is_valid: true, app_id: "123", scopes } }))
      .mockResolvedValueOnce(reply({ data: [{ id: "101", name: "Page" }] }));
    expect((await GET(request())).headers.get("location")).toContain("meta=unavailable");
    expect(mocks.db.$transaction).not.toHaveBeenCalled(); expect(console.error).toHaveBeenCalledWith("Meta callback failed", "Error");
  });
});
