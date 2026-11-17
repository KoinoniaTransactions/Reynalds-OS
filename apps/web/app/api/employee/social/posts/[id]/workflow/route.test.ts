import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ actor: { id: "owner", role: "Owner", workspaceId: "w1" },
  tx: { socialPost: { findFirst: vi.fn() }, socialPostVariant: { updateMany: vi.fn() },
    socialApproval: { create: vi.fn(), updateMany: vi.fn() }, auditEvent: { create: vi.fn() } } }));
vi.mock("../../../../../../../lib/auth", () => ({ getAuthProvider: () => "clerk", assertPermission: vi.fn(async () => mocks.actor) }));
vi.mock("../../../../../../../lib/api-auth", () => ({ getAuthErrorResponse: () => null }));
vi.mock("../../../../../../../lib/db", () => ({ prisma: { $transaction: async (fn: (tx: typeof mocks.tx) => unknown) => fn(mocks.tx) } }));
import { POST } from "./route";
const post = { id: "p1", workspaceId: "w1", createdById: "owner", variants: [{ id: "v1", status: "in_review", revision: 2, scheduledAt: null, caption: "Approved copy", media: null }] };
function call(action: string, extra = {}) {
  return POST(new Request("https://preview.example/api/employee/social/posts/p1/workflow", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, variantId: "v1", revision: 2, ...extra }) }), { params: Promise.resolve({ id: "p1" }) });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("SOCIAL_CONTENT_STUDIO_ENABLED", "true");
  mocks.actor.role = "Owner"; mocks.tx.socialPost.findFirst.mockResolvedValue(structuredClone(post)); mocks.tx.socialPostVariant.updateMany.mockResolvedValue({ count: 1 });
});
afterEach(() => vi.unstubAllEnvs());
describe("approval integrity and workspace access", () => {
  it("requires acknowledgment for owner self approval", async () => {
    expect((await call("approve")).status).toBe(403);
    expect(mocks.tx.socialApproval.create).not.toHaveBeenCalled();
  });
  it("records approval and exact reviewed content", async () => {
    expect((await call("approve", { ownerSelfApprovalAcknowledged: true })).status).toBe(200);
    expect(mocks.tx.socialApproval.create).toHaveBeenCalledWith({ data: { variantId: "v1", revision: 2, approvedById: "owner" } });
    expect(mocks.tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ metadata: expect.objectContaining({ caption: "Approved copy", revision: 2 }) }) }));
    expect(mocks.tx.socialPost.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "p1", workspaceId: "w1" } }));
  });
  it("denies ordinary staff approval and missing workspace records", async () => {
    mocks.actor.role = "Staff"; expect((await call("approve")).status).toBe(403);
    mocks.actor.role = "Owner"; mocks.tx.socialPost.findFirst.mockResolvedValue(null);
    expect((await call("approve")).status).toBe(404);
  });
  it("rejects stale revision and concurrent state changes before inserting approval", async () => {
    expect((await call("approve", { revision: 1 })).status).toBe(409);
    mocks.tx.socialPostVariant.updateMany.mockResolvedValue({ count: 0 });
    expect((await call("approve", { ownerSelfApprovalAcknowledged: true })).status).toBe(409);
    expect(mocks.tx.socialApproval.create).not.toHaveBeenCalled();
  });
  it("returns approved versions to draft, revokes approval, and clears the date", async () => {
    mocks.tx.socialPost.findFirst.mockResolvedValue({ ...post, variants: [{ ...post.variants[0], status: "approved", scheduledAt: new Date() }] });
    expect((await call("revise")).status).toBe(200);
    expect(mocks.tx.socialPostVariant.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "draft", scheduledAt: null } }));
    expect(mocks.tx.socialApproval.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { variantId: "v1", revokedAt: null } }));
  });
  it("does not reopen a scheduled or published version", async () => {
    for (const status of ["scheduled", "publishing", "published"]) {
      mocks.tx.socialPost.findFirst.mockResolvedValue({ ...post, variants: [{ ...post.variants[0], status }] });
      expect((await call("revise")).status).toBe(409);
    }
  });
});
