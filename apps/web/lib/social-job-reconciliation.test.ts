import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ find: vi.fn(), account: vi.fn(), verify: vi.fn(), open: vi.fn(), tx: { socialPublishJob: { updateMany: vi.fn() }, socialPostVariant: { updateMany: vi.fn() }, auditEvent: { create: vi.fn() } } }));
vi.mock("./db", () => ({ prisma: { socialPublishJob: { findFirst: m.find }, socialChannelConnection: { findFirst: m.account }, $transaction: async (fn: (tx: typeof m.tx) => unknown) => fn(m.tx) } }));
vi.mock("./social-connection-vault", () => ({ openSocialConnection: m.open }));
vi.mock("./social-provider-adapters", () => ({ socialProviderAdapter: () => ({ verify: m.verify }) }));
import { reconcileSocialJob } from "./social-job-reconciliation";
const actor = { id: "owner", role: "Owner", workspaceId: "w1" };
beforeEach(() => { vi.clearAllMocks(); m.find.mockResolvedValue({ id: "j1", mode: "live", status: "needs_reconciliation", connectionId: "c1", variantId: "v1", revision: 2, externalPostId: null, lockedUntil: null,
  snapshot: { workspaceId: "w1", variantId: "v1", revision: 2, platform: "facebook", caption: "Approved", media: [], campaignKey: null } });
  m.account.mockResolvedValue({ id: "c1", providerAccountId: "101", expiresAt: null, vault: { encodedData: "encrypted" } }); m.open.mockReturnValue({ accessToken: "test-token" }); m.verify.mockResolvedValue(true); m.tx.socialPublishJob.updateMany.mockResolvedValue({ count: 1 }); });
describe("uncertain publish reconciliation", () => {
  it("requires owner acknowledgment before reading credentials or providers", async () => {
    await expect(reconcileSocialJob({ ...actor, role: "Admin" }, "j1", "101_202", true)).rejects.toMatchObject({ status: 403 });
    await expect(reconcileSocialJob(actor, "j1", "101_202", false)).rejects.toMatchObject({ status: 400 }); expect(m.open).not.toHaveBeenCalled(); expect(m.verify).not.toHaveBeenCalled();
  });
  it("resolves only after provider account and caption verification, with an audit", async () => {
    expect(await reconcileSocialJob(actor, "j1", "101_202", true)).toMatchObject({ status: "published", externalId: "101_202" });
    expect(m.find).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "j1", variant: { post: { workspaceId: "w1" } } } }));
    expect(m.verify).toHaveBeenCalledTimes(1); expect(m.tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ actorId: "owner", action: "social.job.reconciled" }) }));
  });
  it("does not change jobs when the provider post fails verification", async () => {
    m.verify.mockResolvedValue(false); await expect(reconcileSocialJob(actor, "j1", "101_202", true)).rejects.toThrow("does not match"); expect(m.tx.socialPublishJob.updateMany).not.toHaveBeenCalled();
  });
  it("fences concurrent reconciliation updates", async () => {
    m.tx.socialPublishJob.updateMany.mockResolvedValue({ count: 0 }); await expect(reconcileSocialJob(actor, "j1", "101_202", true)).rejects.toThrow("Job changed"); expect(m.tx.auditEvent.create).not.toHaveBeenCalled();
  });
});
