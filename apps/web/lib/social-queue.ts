import type { Prisma } from "@reynalds-os/database";
import { prisma } from "./db";
import { liveSocialContentProblem, liveSocialPublishingEnabled, parseSocialSchedule, readSocialSnapshot, socialQueueKey } from "./social-queue-policy";

export class SocialQueueError extends Error {
  constructor(message: string, public status = 409) { super(message); this.name = "SocialQueueError"; }
}
export type SocialQueueActor = { id: string; role: string; workspaceId: string };
export async function enqueueSocialVariant(actor: SocialQueueActor, input: {
  variantId: string; revision: number; scheduledAt: string; timeZone: string; mode: "dry_run" | "live"; connectionId: string | null;
}) {
  if (actor.role !== "Owner") throw new SocialQueueError("Only the owner can queue approved content", 403);
  if (input.mode === "dry_run" && input.connectionId !== null) throw new SocialQueueError("Simulation does not bind a provider account", 400);
  if (input.mode === "dry_run" && process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "test") throw new SocialQueueError("Simulation jobs are restricted to Preview", 403);
  if (input.mode === "live" && !liveSocialPublishingEnabled()) throw new SocialQueueError("Live publishing is disabled", 503);
  let scheduledAt: Date;
  try { scheduledAt = parseSocialSchedule(input.scheduledAt, input.timeZone); }
  catch { throw new SocialQueueError("Choose a future timestamp with an explicit offset and valid timezone", 400); }
  const key = socialQueueKey(actor.workspaceId, input.variantId, input.revision, input.connectionId, input.mode);
  return prisma.$transaction(async tx => {
    const previous = await tx.socialPublishJob.findUnique({ where: { idempotencyKey: key } });
    if (previous) return { id: previous.id, status: previous.status, existing: true };
    const variant = await tx.socialPostVariant.findFirst({ where: { id: input.variantId, post: { workspaceId: actor.workspaceId } }, include: { post: true, approvals: { where: { revision: input.revision, revokedAt: null } } } });
    if (!variant) throw new SocialQueueError("Content version not found", 404);
    if (variant.status !== "approved" || variant.revision !== input.revision || !variant.approvals.length) throw new SocialQueueError("Current revision must have an active approval");
    const snapshot = readSocialSnapshot({ workspaceId: actor.workspaceId, variantId: variant.id, revision: variant.revision, platform: variant.platform, caption: variant.caption, media: variant.media ?? [], campaignKey: variant.post.campaignKey });
    if (input.mode === "live") {
      const problem = liveSocialContentProblem(snapshot);
      if (problem) throw new SocialQueueError(problem);
      const connection = input.connectionId ? await tx.socialChannelConnection.findFirst({ where: { id: input.connectionId, workspaceId: actor.workspaceId, platform: variant.platform, status: "connected", publishingEnabled: true }, include: { vault: { select: { id: true } } } }) : null;
      if (!connection?.vault || (connection.expiresAt && connection.expiresAt <= new Date())) throw new SocialQueueError("Select an authorized, unexpired publishing account");
      if (process.env["SOCIAL_" + variant.platform.toUpperCase() + "_ADAPTER_VERIFIED"] !== "true") throw new SocialQueueError("Provider adapter has not passed its activation review", 503);
    }
    const changed = await tx.socialPostVariant.updateMany({ where: { id: variant.id, revision: input.revision, status: "approved" }, data: { status: "scheduled", scheduledAt, connectionId: input.connectionId } });
    if (changed.count !== 1) throw new SocialQueueError("Content changed while queueing; refresh");
    const job = await tx.socialPublishJob.create({ data: { variantId: variant.id, revision: variant.revision, connectionId: input.connectionId, mode: input.mode, snapshot: snapshot as unknown as Prisma.InputJsonValue,
      timeZone: input.timeZone, queuedById: actor.id, scheduledAt,
      nextAttemptAt: input.mode === "live" ? new Date(Math.max(Date.now(), scheduledAt.getTime() - 30 * 60000)) : scheduledAt, idempotencyKey: key } });
    await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.job.queued", subjectType: "SocialPublishJob", subjectId: job.id,
      summary: input.mode === "dry_run" ? "Approved revision queued for simulation; no provider request authorized" : "Owner queued an approved revision for publishing", metadata: { variantId: variant.id, revision: variant.revision, mode: input.mode, scheduledAt: scheduledAt.toISOString(), timeZone: input.timeZone, connectionId: input.connectionId } } });
    return { id: job.id, status: job.status, existing: false };
  });
}

export async function changeSocialJob(actor: SocialQueueActor, id: string, action: "cancel" | "retry") {
  if (actor.role !== "Owner") throw new SocialQueueError("Owner permission required", 403);
  return prisma.$transaction(async tx => {
    const job = await tx.socialPublishJob.findFirst({ where: { id, variant: { post: { workspaceId: actor.workspaceId } } }, include: { variant: { include: { approvals: { where: { revokedAt: null } } } } } });
    if (!job) throw new SocialQueueError("Job not found", 404);
    if (job.dispatchStartedAt || job.externalPostId || (job.lockedUntil && job.lockedUntil > new Date())) throw new SocialQueueError("Job may already be in flight; reconcile its status before changing it");
    if (action === "cancel" && !["scheduled", "retry_wait", "preparing", "failed", "needs_reauthorization"].includes(job.status)) throw new SocialQueueError("Job cannot be canceled in this state");
    if (action === "retry" && (!["failed", "needs_reauthorization"].includes(job.status) || !job.lastErrorCode?.startsWith("retryable_") || job.attemptsCount >= 10)) throw new SocialQueueError("Only a confirmed non-published retryable failure can be retried");
    if (action === "retry" && (job.variant.revision !== job.revision || !job.variant.approvals.some(a => a.revision === job.revision))) throw new SocialQueueError("Current approval is missing");
    const changed = await tx.socialPublishJob.updateMany({ where: { id, status: job.status, dispatchStartedAt: null, externalPostId: null, OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }] },
      data: { status: action === "cancel" ? "canceled" : "retry_wait", nextAttemptAt: action === "retry" ? new Date() : null, lockedUntil: null, leaseToken: null } });
    if (changed.count !== 1) throw new SocialQueueError("Job changed; refresh");
    if (action === "cancel") {
      await tx.socialPostVariant.updateMany({ where: { id: job.variantId, revision: job.revision, status: { in: ["scheduled", "failed", "needs_reauthorization"] } }, data: { status: "draft", scheduledAt: null, revision: { increment: 1 } } });
      await tx.socialApproval.updateMany({ where: { variantId: job.variantId, revision: job.revision, revokedAt: null }, data: { revokedAt: new Date() } });
    } else await tx.socialPostVariant.updateMany({ where: { id: job.variantId, revision: job.revision, status: { in: ["failed", "needs_reauthorization"] } }, data: { status: "scheduled" } });
    await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.job." + action, subjectType: "SocialPublishJob", subjectId: id,
      summary: action === "cancel" ? "Job canceled; content returned to draft for fresh approval" : "Owner requested a safe retry of the same job", metadata: { revision: job.revision, mode: job.mode } } });
    return { saved: true };
  });
}
