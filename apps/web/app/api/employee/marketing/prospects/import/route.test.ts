import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ actor: { id: "owner", role: "Owner", workspaceId: "w1" }, provider: "clerk", run: vi.fn() }));
vi.mock("../../../../../../lib/auth", () => ({ getAuthProvider: () => m.provider, assertPermission: async () => m.actor }));
vi.mock("../../../../../../lib/api-auth", () => ({ getAuthErrorResponse: () => null }));
vi.mock("../../../../../../lib/koinonia-prospect-import", () => ({ importProspects: m.run, ProspectImportError: class extends Error {} }));
import { POST } from "./route";
const request = (body = { action: "preview", csv: "synthetic" }, origin = "https://preview.example") => new Request("https://preview.example/api/employee/marketing/prospects/import", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("VERCEL_ENV", "preview"); m.actor.role = "Owner"; m.provider = "clerk"; m.run.mockResolvedValue({ ready: 1, committed: false }); });
afterEach(() => vi.unstubAllEnvs());
describe("Preview prospect import boundary", () => {
  it("rejects production, mock auth and staff before invoking the importer", async () => {
    vi.stubEnv("VERCEL_ENV", "production"); expect((await POST(request())).status).toBe(503);
    vi.stubEnv("VERCEL_ENV", "preview"); m.provider = "mock"; expect((await POST(request())).status).toBe(503);
    m.provider = "clerk"; m.actor.role = "Admin"; expect((await POST(request())).status).toBe(403); expect(m.run).not.toHaveBeenCalled();
  });
  it("rejects cross-origin and malformed actions", async () => {
    expect((await POST(request(undefined, "https://other.example"))).status).toBe(403);
    expect((await POST(request({ action: "send", csv: "synthetic" }))).status).toBe(400); expect(m.run).not.toHaveBeenCalled();
  });
  it("passes only authenticated actor and explicit review state and disables caching", async () => {
    const response = await POST(request()); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store");
    expect(m.run).toHaveBeenCalledWith(m.actor, "synthetic", false, false);
  });
});
