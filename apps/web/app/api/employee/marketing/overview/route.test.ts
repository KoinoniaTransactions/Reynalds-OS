import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ actor: { id: "owner", role: "Owner", workspaceId: "w1" }, provider: "clerk", db: {
  rosObject: { findMany: vi.fn(), count: vi.fn() }, socialPublishJob: { groupBy: vi.fn(), findMany: vi.fn() }, socialChannelConnection: { findMany: vi.fn() }, task: { count: vi.fn() }
} }));
vi.mock("../../../../../lib/auth", () => ({ getAuthProvider: () => m.provider, assertPermission: async () => m.actor }));
vi.mock("../../../../../lib/api-auth", () => ({ getAuthErrorResponse: () => null }));
vi.mock("../../../../../lib/db", () => ({ prisma: m.db }));
import { GET } from "./route";
beforeEach(() => { vi.clearAllMocks(); m.actor.role = "Owner"; m.provider = "clerk"; vi.stubEnv("SOCIAL_PUBLISHING_ENABLED", "false");
  m.db.rosObject.findMany.mockResolvedValue([{ status: "Lead", data: { contact: { email: "private@example.com" } } }]); m.db.rosObject.count.mockResolvedValue(1);
  m.db.socialPublishJob.groupBy.mockResolvedValue([]); m.db.socialPublishJob.findMany.mockResolvedValue([]); m.db.socialChannelConnection.findMany.mockResolvedValue([]); m.db.task.count.mockResolvedValue(2); });
afterEach(() => vi.unstubAllEnvs());
describe("owner acquisition reporting", () => {
  it("requires a managed owner before querying the database", async () => {
    m.provider = "mock"; expect((await GET()).status).toBe(503);
    m.provider = "clerk"; m.actor.role = "Admin"; expect((await GET()).status).toBe(403);
    expect(m.db.rosObject.findMany).not.toHaveBeenCalled();
  });
  it("scopes every query and returns aggregates without contact details", async () => {
    const response = await GET(); const payload = await response.json();
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store");
    expect(payload).toMatchObject({ totalRecords: 1, truncated: false, overdueFollowUps: 2, livePublishingEnabled: false, report: { relationships: 1, websiteVisits: null } });
    expect(JSON.stringify(payload)).not.toContain("private@example.com");
    expect(m.db.rosObject.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { workspaceId: "w1", objectType: "Relationship", archivedAt: null } }));
    expect(m.db.socialPublishJob.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { variant: { post: { workspaceId: "w1" } } } }));
    expect(m.db.task.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ workspaceId: "w1" }) }));
  });
});
