import { NextRequest } from "next/server";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ actor: { id: "owner", workspaceId: "w1", role: "Owner" }, db: { socialAuthorization: { findUnique: vi.fn(), updateMany: vi.fn() }, $transaction: vi.fn() }, tx: { socialChannelConnection: { upsert: vi.fn() }, socialConnectionVault: { upsert: vi.fn() }, auditEvent: { create: vi.fn() } }, fetch: vi.fn() }));
vi.mock("../../../../../../../lib/auth", () => ({ getAuthProvider: () => "clerk", assertPermission: async () => m.actor }));
vi.mock("../../../../../../../lib/db", () => ({ prisma: m.db }));
vi.mock("../../../../../../../lib/social-connection-vault", () => ({ sealSocialConnection: () => "encrypted-envelope" }));
import { GET } from "./route";
const callback = "https://www.koinoniatransactions.com/api/employee/social/oauth/linkedin/callback";
const response = (value: unknown) => new Response(JSON.stringify(value));
function request(params = "state=nonce&code=code") { return new NextRequest(callback + "?" + params, { headers: { cookie: "koinonia_linkedin_oauth_state=nonce" } }); }
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal("fetch", m.fetch); vi.spyOn(console, "error").mockImplementation(() => {}); m.actor.role = "Owner";
  for (const [key, value] of Object.entries({ LINKEDIN_CLIENT_ID: "client123", LINKEDIN_CLIENT_SECRET: "test-secret", SOCIAL_CONNECTION_VAULT_KEY: "test-key", SOCIAL_LINKEDIN_OAUTH_ENABLED: "true", SOCIAL_LINKEDIN_API_VERSION: "202609", SOCIAL_LINKEDIN_ORGANIZATION_URN: "urn:li:organization:101", SOCIAL_LINKEDIN_CALLBACK_URL: callback })) vi.stubEnv(key, value);
  m.db.socialAuthorization.findUnique.mockResolvedValue({ id: "state1", workspaceId: "w1", actorId: "owner", platform: "linkedin", status: "pending", expiresAt: new Date(Date.now() + 600000) });
  m.db.socialAuthorization.updateMany.mockResolvedValue({ count: 1 }); m.db.$transaction.mockImplementation(async (fn: (tx: typeof m.tx) => unknown) => fn(m.tx)); m.tx.socialChannelConnection.upsert.mockResolvedValue({ id: "c1" });
  m.fetch.mockReset().mockResolvedValueOnce(response({ access_token: "test-token" })).mockResolvedValueOnce(response({ active: true, client_id: "client123", auth_type: "3L", expires_at: 2000000000, scope: "r_organization_admin,w_organization_social,r_organization_social" })).mockResolvedValueOnce(response({ elements: [{ organization: "urn:li:organization:101", roleAssignee: "urn:li:person:member1", state: "APPROVED", role: "ADMINISTRATOR" }] }));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("LinkedIn callback workspace and grant integrity", () => {
  it("validates token and organization role before atomically storing the encrypted grant", async () => {
    expect((await GET(request())).headers.get("location")).toContain("linkedin=connected"); expect(m.db.$transaction).toHaveBeenCalledTimes(1);
    expect(m.tx.socialChannelConnection.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ workspaceId: "w1", platform: "linkedin", providerAccountId: "urn:li:organization:101", status: "connected" }) }));
    expect(m.tx.socialConnectionVault.upsert).toHaveBeenCalledTimes(1);
  });
  it("rejects replayed or cross-workspace states before provider access", async () => {
    m.db.socialAuthorization.updateMany.mockResolvedValue({ count: 0 }); expect((await GET(request())).headers.get("location")).toContain("linkedin=invalid"); expect(m.fetch).not.toHaveBeenCalled();
    m.db.socialAuthorization.findUnique.mockResolvedValue({ workspaceId: "other" }); expect((await GET(request())).headers.get("location")).toContain("linkedin=invalid");
  });
  it("consumes denied authorization without requesting tokens", async () => {
    expect((await GET(request("state=nonce&error=access_denied"))).headers.get("location")).toContain("linkedin=denied"); expect(m.db.socialAuthorization.updateMany).toHaveBeenCalled(); expect(m.fetch).not.toHaveBeenCalled();
  });
  it("does not create a connection for an unapproved organization role", async () => {
    m.fetch.mockReset().mockResolvedValueOnce(response({ access_token: "test-token" })).mockResolvedValueOnce(response({ active: true, client_id: "client123", auth_type: "3L", expires_at: 2000000000, scope: "r_organization_admin,w_organization_social,r_organization_social" })).mockResolvedValueOnce(response({ elements: [] }));
    expect((await GET(request())).headers.get("location")).toContain("linkedin=unavailable"); expect(m.db.$transaction).not.toHaveBeenCalled();
  });
});
