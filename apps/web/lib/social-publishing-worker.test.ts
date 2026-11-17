import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ tx: { socialPublishJob: { findFirst: vi.fn(), updateMany: vi.fn() }, socialPublishAttempt: { create: vi.fn(), updateMany: vi.fn() }, socialPostVariant: { updateMany: vi.fn() }, auditEvent: { create: vi.fn() }, notification: { create: vi.fn() } },
  jobList: vi.fn(), connection: vi.fn(), openVault: vi.fn(), provider: vi.fn(), adapter: { prepare: vi.fn(), publish: vi.fn(), verify: vi.fn() } }));
vi.mock("./db", () => ({ prisma: { $transaction: async (fn: (tx: typeof m.tx) => unknown) => fn(m.tx), socialPublishJob: { findMany: m.jobList }, socialChannelConnection: { findFirst: m.connection } } }));
vi.mock("./social-connection-vault", () => ({ openSocialConnection: m.openVault }));
vi.mock("./social-provider-adapters", async original => { const actual = await original<typeof import("./social-provider-adapters")>(); return { ...actual, socialProviderAdapter: m.provider }; });
import { runSocialPublishingWorker } from "./social-publishing-worker";
import { SocialProviderError } from "./social-provider-adapters";
const snapshot = { workspaceId: "w1", variantId: "v1", revision: 2, platform: "facebook", caption: "Approved copy", media: [], campaignKey: null };
function fixture(extra = {}) { return { id: "job1", mode: "dry_run", status: "scheduled", variantId: "v1", revision: 2, attemptsCount: 0, scheduledAt: new Date(0), nextAttemptAt: new Date(0), snapshot, connectionId: "c1", externalPostId: null, dispatchStartedAt: null, leaseToken: null, providerState: null,
  variant: { id: "v1", post: { workspaceId: "w1" }, status: "scheduled", revision: 2, platform: "facebook", caption: "Approved copy", media: null, approvals: [{ revision: 2 }] }, ...extra }; }
function queued(job: ReturnType<typeof fixture>) { m.tx.socialPublishJob.findFirst.mockResolvedValueOnce(job).mockResolvedValue(null); }
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("SOCIAL_PUBLISHING_ENABLED", "false"); vi.stubEnv("SOCIAL_LIVE_PUBLISHING_OWNER_APPROVED", "false");
  m.jobList.mockResolvedValue([]); m.tx.socialPublishJob.updateMany.mockResolvedValue({ count: 1 });
  m.tx.socialPostVariant.updateMany.mockResolvedValue({ count: 1 });
  m.openVault.mockReturnValue({ accessToken: "fake-token" }); m.provider.mockReturnValue(m.adapter);
  m.connection.mockResolvedValue({ id: "c1", providerAccountId: "101", scopes: ["pages_manage_posts", "pages_read_engagement"], vault: { encodedData: "envelope" }, expiresAt: null });
});
afterEach(() => vi.unstubAllEnvs());
function enable() { vi.stubEnv("SOCIAL_PUBLISHING_ENABLED", "true"); vi.stubEnv("SOCIAL_LIVE_PUBLISHING_OWNER_APPROVED", "true"); vi.stubEnv("SOCIAL_FACEBOOK_ADAPTER_VERIFIED", "true"); }
describe("durable publishing worker", () => {
  it("does nothing at all when live activation is disabled", async () => {
    expect(await runSocialPublishingWorker({ mode: "live" })).toMatchObject({ disabled: true, processed: 0 });
    expect(m.jobList).not.toHaveBeenCalled(); expect(m.connection).not.toHaveBeenCalled();
  });
  it("simulates a due approved revision without decrypting credentials or calling providers", async () => {
    queued(fixture());
    expect((await runSocialPublishingWorker({ mode: "dry_run", workspaceId: "w1" })).results).toEqual(["simulated"]);
    expect(m.openVault).not.toHaveBeenCalled(); expect(m.provider).not.toHaveBeenCalled(); expect(m.connection).not.toHaveBeenCalled();
    expect(m.tx.socialPublishJob.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "simulated" }) }));
  });
  it("never executes a job when its atomic lease was claimed elsewhere", async () => {
    queued(fixture()); m.tx.socialPublishJob.updateMany.mockResolvedValueOnce({ count: 0 });
    expect((await runSocialPublishingWorker({ mode: "dry_run" })).processed).toBe(0); expect(m.tx.socialPublishAttempt.create).not.toHaveBeenCalled();
  });
  it("rejects changed or revoked approved content before provider access", async () => {
    enable(); queued(fixture({ mode: "live", snapshot: { ...snapshot, caption: "Different copy" } }));
    expect((await runSocialPublishingWorker({ mode: "live" })).results).toEqual(["failed"]);
    expect(m.provider).not.toHaveBeenCalled(); expect(m.tx.notification.create).toHaveBeenCalled();
  });
  it("persists preparation before any public publishing request", async () => {
    enable(); queued(fixture({ mode: "live" })); m.adapter.prepare.mockResolvedValue({ ready: true, state: { mediaIds: [] } });
    expect((await runSocialPublishingWorker({ mode: "live" })).results).toEqual(["preparing"]); expect(m.adapter.publish).not.toHaveBeenCalled();
    expect(m.tx.socialPublishJob.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ providerState: { mediaIds: [], prepared: true } }) }));
  });
  it("records uncertain publication and blocks automatic retry after a transport failure", async () => {
    enable(); queued(fixture({ mode: "live", providerState: { prepared: true } }));
    m.adapter.publish.mockRejectedValue(new SocialProviderError("ambiguous", "transport_failure"));
    expect((await runSocialPublishingWorker({ mode: "live" })).results).toEqual(["needs_reconciliation"]);
    expect(m.adapter.publish).toHaveBeenCalledTimes(1);
    expect(m.tx.socialPublishJob.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "needs_reconciliation", nextAttemptAt: null }) }));
  });
  it("prepares early but cannot publish before the requested instant", async () => {
    enable(); queued(fixture({ mode: "live", providerState: { prepared: true }, scheduledAt: new Date(Date.now() + 600000) }));
    expect((await runSocialPublishingWorker({ mode: "live" })).results).toEqual(["waiting_schedule"]); expect(m.adapter.publish).not.toHaveBeenCalled();
  });
  it("retries explicit non-published rate limits without discarding prepared media", async () => {
    enable(); queued(fixture({ mode: "live", providerState: { prepared: true } }));
    m.adapter.publish.mockRejectedValue(new SocialProviderError("retryable", "rate_limit", 120));
    expect((await runSocialPublishingWorker({ mode: "live" })).results).toEqual(["retry_wait"]);
    expect(m.tx.socialPublishJob.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "retry_wait", dispatchStartedAt: null }) }));
  });
  it("verifies a recorded provider ID instead of publishing it again", async () => {
    enable(); queued(fixture({ mode: "live", externalPostId: "101_202", dispatchStartedAt: new Date(), providerState: { prepared: true } })); m.adapter.verify.mockResolvedValue(true);
    expect((await runSocialPublishingWorker({ mode: "live" })).results).toEqual(["published"]); expect(m.adapter.publish).not.toHaveBeenCalled();
  });
  it("recovers an expired dispatch lease into reconciliation rather than retry", async () => {
    m.jobList.mockResolvedValue([{ ...fixture({ mode: "live", dispatchStartedAt: new Date(), status: "processing" }), leaseToken: "old-lease" }]);
    m.tx.socialPublishJob.findFirst.mockResolvedValue(null); enable();
    await runSocialPublishingWorker({ mode: "live" });
    expect(m.tx.socialPublishJob.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ leaseToken: "old-lease" }), data: expect.objectContaining({ status: "needs_reconciliation" }) }));
    expect(m.adapter.publish).not.toHaveBeenCalled();
  });
});
