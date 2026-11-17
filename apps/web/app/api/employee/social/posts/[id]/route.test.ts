import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const tx = vi.hoisted(() => ({ socialPost: { findFirst: vi.fn(), update: vi.fn() }, socialPostVariant: { updateMany: vi.fn() },
  socialApproval: { updateMany: vi.fn() }, auditEvent: { create: vi.fn() } }));
vi.mock("../../../../../../lib/auth", () => ({ getAuthProvider: () => "clerk", assertPermission: async () => ({ id: "owner", workspaceId: "w1" }) }));
vi.mock("../../../../../../lib/api-auth", () => ({ getAuthErrorResponse: () => null }));
vi.mock("../../../../../../lib/db", () => ({ prisma: { $transaction: async (fn: (client: typeof tx) => unknown) => fn(tx) } }));
import { PATCH } from "./route";
function edit() { return PATCH(new Request("https://preview.example", { method: "PATCH", body: JSON.stringify({ title: "New title", caption: "New copy", variantId: "v1", revision: 2 }) }), { params: Promise.resolve({ id: "p1" }) }); }
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("SOCIAL_CONTENT_STUDIO_ENABLED", "true");
  tx.socialPost.findFirst.mockResolvedValue({ id: "p1", status: "draft", title: "Old title", variants: [{ id: "v1", caption: "Old copy", revision: 2, status: "draft" }] });
  tx.socialPostVariant.updateMany.mockResolvedValue({ count: 1 }); });
afterEach(() => vi.unstubAllEnvs());
describe("caption edit revision integrity", () => {
  it("revokes prior approvals, clears plans, increments revision and retains old copy", async () => {
    expect((await edit()).status).toBe(200);
    expect(tx.socialPostVariant.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ revision: { increment: 1 }, scheduledAt: null }) }));
    expect(tx.socialApproval.updateMany).toHaveBeenCalled();
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ metadata: expect.objectContaining({ previousCaption: "Old copy", caption: "New copy" }) }) }));
  });
  it("does not modify approvals or title after a concurrent edit", async () => {
    tx.socialPostVariant.updateMany.mockResolvedValue({ count: 0 });
    expect((await edit()).status).toBe(409); expect(tx.socialApproval.updateMany).not.toHaveBeenCalled(); expect(tx.socialPost.update).not.toHaveBeenCalled();
  });
});
