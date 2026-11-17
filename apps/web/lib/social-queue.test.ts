import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const tx = vi.hoisted(() => ({ socialPublishJob: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn() }, socialPostVariant: { findFirst: vi.fn(), updateMany: vi.fn() }, socialChannelConnection: { findFirst: vi.fn() }, socialApproval: { updateMany: vi.fn() }, auditEvent: { create: vi.fn() } }));
vi.mock("./db", () => ({ prisma: { $transaction: async (fn: (client: typeof tx) => unknown) => fn(tx) } }));
import { changeSocialJob, enqueueSocialVariant } from "./social-queue";
const actor = { id: "owner", role: "Owner", workspaceId: "w1" };
const input = () => ({ variantId: "v1", revision: 2, scheduledAt: new Date(Date.now() + 300000).toISOString(), timeZone: "America/Denver", mode: "dry_run" as const, connectionId: null });
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("SOCIAL_PUBLISHING_ENABLED", "false");
  tx.socialPublishJob.findUnique.mockResolvedValue(null);
  tx.socialPostVariant.findFirst.mockResolvedValue({ id: "v1", status: "approved", revision: 2, platform: "facebook", caption: "Approved copy", media: null, post: { campaignKey: "campaign-1" }, approvals: [{ revision: 2 }] });
  tx.socialPostVariant.updateMany.mockResolvedValue({ count: 1 });
  tx.socialPublishJob.create.mockResolvedValue({ id: "job1", status: "scheduled" });
});
afterEach(() => vi.unstubAllEnvs());
describe("workspace-scoped owner queue", () => {
  it("requires the owner and refuses live queueing while activation is disabled", async () => {
    await expect(enqueueSocialVariant({ ...actor, role: "Admin" }, input())).rejects.toMatchObject({ status: 403 });
    await expect(enqueueSocialVariant(actor, { ...input(), mode: "live" })).rejects.toMatchObject({ status: 503 }); expect(tx.socialPublishJob.create).not.toHaveBeenCalled();
  });
  it("freezes the approved version and does not access provider credentials for simulations", async () => {
    expect(await enqueueSocialVariant(actor, input())).toMatchObject({ id: "job1", existing: false });
    expect(tx.socialPostVariant.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "v1", post: { workspaceId: "w1" } } }));
    expect(tx.socialPublishJob.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ mode: "dry_run", snapshot: expect.objectContaining({ caption: "Approved copy", revision: 2, workspaceId: "w1" }) }) }));
    expect(tx.socialChannelConnection.findFirst).not.toHaveBeenCalled();
  });
  it("returns the existing job for a repeated identical queue request", async () => {
    tx.socialPublishJob.findUnique.mockResolvedValue({ id: "existing", status: "scheduled" });
    expect(await enqueueSocialVariant(actor, input())).toEqual({ id: "existing", status: "scheduled", existing: true }); expect(tx.socialPublishJob.create).not.toHaveBeenCalled();
  });
  it("rejects stale revisions and concurrent queue claims", async () => {
    await expect(enqueueSocialVariant(actor, { ...input(), revision: 1 })).rejects.toThrow("Current revision");
    tx.socialPostVariant.updateMany.mockResolvedValue({ count: 0 });
    await expect(enqueueSocialVariant(actor, input())).rejects.toThrow("Content changed"); expect(tx.socialPublishJob.create).not.toHaveBeenCalled();
  });
  it("refuses to retry or cancel a dispatch with an uncertain provider outcome", async () => {
    tx.socialPublishJob.findFirst.mockResolvedValue({ id: "job1", dispatchStartedAt: new Date(), externalPostId: null });
    for (const action of ["retry", "cancel"] as const) await expect(changeSocialJob(actor, "job1", action)).rejects.toThrow("in flight");
    expect(tx.socialPublishJob.updateMany).not.toHaveBeenCalled();
  });
});
