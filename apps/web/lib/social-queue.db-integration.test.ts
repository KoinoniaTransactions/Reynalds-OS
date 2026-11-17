import { randomUUID } from "node:crypto";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

const enabled = process.env.RUN_SOCIAL_QUEUE_DB_INTEGRATION === "true";
vi.mock("./db", async () => {
  if (process.env.RUN_SOCIAL_QUEUE_DB_INTEGRATION !== "true") return { prisma: {} };
  const raw = process.env.SOCIAL_QUEUE_TEST_DATABASE_URL;
  const url = raw ? new URL(raw) : null;
  // Never run fixture creation or cleanup against a cloud/production database.
  if (!url || !["localhost", "127.0.0.1", "postgres"].includes(url.hostname) || url.pathname !== "/resend_webhook_test") throw new Error("Social queue integration requires the disposable local CI database");
  const { PrismaClient } = await import("@reynalds-os/database");
  return { prisma: new PrismaClient({ datasources: { db: { url: raw } } }) };
});
import { prisma } from "./db";
import { enqueueSocialVariant, changeSocialJob } from "./social-queue";
import { runSocialPublishingWorker } from "./social-publishing-worker";

describe.skipIf(!enabled)("social queue on disposable PostgreSQL", () => {
  const workspaceIds: string[] = [];
  const network = vi.fn(() => { throw new Error("Provider requests are forbidden in queue integration tests"); });
  beforeAll(() => { vi.stubGlobal("fetch", network); });
  afterAll(async () => {
    // Only UUID-tagged fixtures created by this test, in the guarded local service DB.
    for (const workspaceId of workspaceIds) {
      await prisma.auditEvent.deleteMany({ where: { workspaceId } });
      await prisma.notification.deleteMany({ where: { workspaceId } });
      await prisma.socialPost.deleteMany({ where: { workspaceId } });
      await prisma.user.deleteMany({ where: { workspaceId } });
      await prisma.workspace.delete({ where: { id: workspaceId } });
    }
    await prisma.$disconnect(); vi.unstubAllGlobals();
  });
  async function fixture() {
    const workspaceId = "test_social_" + randomUUID(); workspaceIds.push(workspaceId);
    await prisma.workspace.create({ data: { id: workspaceId, name: "Disposable queue integration fixture", type: "company" } });
    const user = await prisma.user.create({ data: { workspaceId, name: "Test Owner", email: randomUUID() + "@example.test" } });
    const post = await prisma.socialPost.create({ data: { workspaceId, createdById: user.id, title: "Simulation fixture", variants: { create: { platform: "facebook", caption: "Private simulation; never publish", status: "approved", revision: 2 } } }, include: { variants: true } });
    const variant = post.variants[0]; await prisma.socialApproval.create({ data: { variantId: variant.id, revision: 2, approvedById: user.id } });
    const actor = { id: user.id, role: "Owner", workspaceId };
    const input = { variantId: variant.id, revision: 2, mode: "dry_run" as const, connectionId: null, scheduledAt: new Date(Date.now() + 120000).toISOString(), timeZone: "America/Denver" };
    const job = await enqueueSocialVariant(actor, input);
    return { actor, input, variant, job };
  }
  async function due(id: string) { await prisma.socialPublishJob.update({ where: { id }, data: { scheduledAt: new Date(0), nextAttemptAt: new Date(0) } }); }
  it("keeps a repeated queue request idempotent and does not execute future work", async () => {
    const { actor, input, job } = await fixture();
    expect((await enqueueSocialVariant(actor, input)).id).toBe(job.id);
    expect(await prisma.socialPublishJob.count({ where: { variantId: input.variantId } })).toBe(1);
    expect((await runSocialPublishingWorker({ mode: "dry_run", workspaceId: actor.workspaceId })).processed).toBe(0);
  });
  it("lets concurrent workers claim a due job exactly once", async () => {
    const { actor, job, variant } = await fixture(); await due(job.id);
    await Promise.all([1, 2, 3].map(() => runSocialPublishingWorker({ mode: "dry_run", workspaceId: actor.workspaceId, limit: 1 })));
    expect(await prisma.socialPublishJob.findUnique({ where: { id: job.id } })).toMatchObject({ status: "simulated", attemptsCount: 1 });
    expect(await prisma.socialPublishAttempt.count({ where: { jobId: job.id } })).toBe(1);
    expect(await prisma.socialPostVariant.findUnique({ where: { id: variant.id } })).toMatchObject({ status: "approved", revision: 2 });
    expect(network).not.toHaveBeenCalled();
  });
  it("rejects another workspace and revokes approval on cancellation", async () => {
    const { actor, job, variant } = await fixture();
    await expect(changeSocialJob({ ...actor, workspaceId: "other-workspace" }, job.id, "cancel")).rejects.toMatchObject({ status: 404 });
    await changeSocialJob(actor, job.id, "cancel");
    expect(await prisma.socialPostVariant.findUnique({ where: { id: variant.id } })).toMatchObject({ status: "draft", revision: 3, scheduledAt: null });
    expect(await prisma.socialApproval.count({ where: { variantId: variant.id, revokedAt: null } })).toBe(0);
  });
  it("refuses changed revisions without altering their newer content", async () => {
    const { actor, job, variant } = await fixture(); await due(job.id);
    await prisma.socialPostVariant.update({ where: { id: variant.id }, data: { revision: 3, caption: "Newer copy", status: "draft" } });
    await runSocialPublishingWorker({ mode: "dry_run", workspaceId: actor.workspaceId });
    expect(await prisma.socialPublishJob.findUnique({ where: { id: job.id } })).toMatchObject({ status: "failed" });
    expect(await prisma.socialPostVariant.findUnique({ where: { id: variant.id } })).toMatchObject({ revision: 3, caption: "Newer copy", status: "draft" });
  });
  it("recovers uncertain expired leases without redispatch or duplicate notifications", async () => {
    const { actor, job, variant } = await fixture();
    await prisma.socialPostVariant.update({ where: { id: variant.id }, data: { status: "publishing" } });
    await prisma.socialPublishJob.update({ where: { id: job.id }, data: { status: "processing", lockedUntil: new Date(0), leaseToken: "expired-test-lease", dispatchStartedAt: new Date(0), attemptsCount: 1 } });
    await prisma.socialPublishAttempt.create({ data: { jobId: job.id, attempt: 1, status: "started" } });
    await runSocialPublishingWorker({ mode: "dry_run", workspaceId: actor.workspaceId });
    await runSocialPublishingWorker({ mode: "dry_run", workspaceId: actor.workspaceId });
    expect(await prisma.socialPublishJob.findUnique({ where: { id: job.id } })).toMatchObject({ status: "needs_reconciliation", attemptsCount: 1 });
    expect(await prisma.notification.count({ where: { workspaceId: actor.workspaceId } })).toBe(1); expect(network).not.toHaveBeenCalled();
  });
});
