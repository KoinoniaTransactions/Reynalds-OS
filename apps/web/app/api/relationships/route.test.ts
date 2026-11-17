import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ authorize: vi.fn(), tx: { rosObject: { count: vi.fn() }, objectRelationship: { create: vi.fn() }, auditEvent: { create: vi.fn() }, timelineEvent: { create: vi.fn() } } }));
vi.mock("../../../lib/auth", () => ({ assertPermission: m.authorize }));
vi.mock("../../../lib/api-auth", () => ({ getAuthErrorResponse: (error: unknown) => error instanceof Error && error.message === "denied" ? new Response(null, { status: 403 }) : null }));
vi.mock("../../../lib/db", () => ({ prisma: { $transaction: async (fn: (tx: typeof m.tx) => unknown) => fn(m.tx) } }));
import { POST } from "./route";
const request = (body = { sourceObjectId: "source", targetObjectId: "target", relationshipType: "referral" }) => new Request("https://preview.example/api/relationships", { method: "POST", body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); m.authorize.mockResolvedValue({ id: "staff", workspaceId: "w1" }); m.tx.rosObject.count.mockResolvedValue(2); m.tx.objectRelationship.create.mockResolvedValue({ id: "link1" }); });
describe("CRM relationship authorization and isolation", () => {
  it("awaits authorization and performs no writes after denial", async () => {
    m.authorize.mockRejectedValue(new Error("denied"));
    expect((await POST(request())).status).toBe(403); expect(m.tx.objectRelationship.create).not.toHaveBeenCalled();
  });
  it("rejects cross-workspace or archived endpoints before writing", async () => {
    m.tx.rosObject.count.mockResolvedValue(1);
    expect((await POST(request())).status).toBe(404);
    expect(m.tx.rosObject.count).toHaveBeenCalledWith({ where: { id: { in: ["source", "target"] }, workspaceId: "w1", archivedAt: null } });
    expect(m.tx.objectRelationship.create).not.toHaveBeenCalled();
  });
  it("writes the relation with its workspace audit and timeline evidence", async () => {
    expect((await POST(request())).status).toBe(201);
    expect(m.tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ workspaceId: "w1", actorId: "staff", subjectId: "link1" }) }));
    expect(m.tx.timelineEvent.create).toHaveBeenCalledTimes(1);
  });
  it("rejects self-links and invalid request bodies", async () => {
    expect((await POST(request({ sourceObjectId: "source", targetObjectId: "source", relationshipType: "referral" }))).status).toBe(400);
    expect(m.tx.objectRelationship.create).not.toHaveBeenCalled();
  });
});
