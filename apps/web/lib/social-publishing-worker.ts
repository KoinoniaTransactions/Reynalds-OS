import { randomUUID } from "node:crypto";
import type { Prisma } from "@reynalds-os/database";
import { prisma } from "./db";
import { openSocialConnection } from "./social-connection-vault";
import { presignR2Object } from "./r2-presign";
import { liveSocialContentProblem, liveSocialPublishingEnabled, readSocialSnapshot, socialRetryAt } from "./social-queue-policy";
import { SocialProviderError, socialProviderAdapter, type ProviderContext } from "./social-provider-adapters";

const LEASE_MS = 180000; // Longer than the route's 60-second maximum execution.
const runnable = ["scheduled", "retry_wait", "preparing", "verifying"];
const json = (value: unknown) => value as Prisma.InputJsonValue;
type WorkerOptions = { mode: "dry_run" | "live"; workspaceId?: string; limit?: number };
type JobContext = Awaited<ReturnType<typeof claimJob>>;

async function notify(tx: Prisma.TransactionClient, workspaceId: string, jobId: string, status: string) {
  await tx.notification.create({ data: { workspaceId, level: "warning", title: "Social publishing needs attention", message: "Job " + jobId + ": " + status + ". Review the publishing activity before retrying.", status: "unread" } });
}
async function recoverExpiredJobs(options: WorkerOptions) {
  const expired = await prisma.socialPublishJob.findMany({ where: { mode: options.mode, status: "processing", lockedUntil: { lt: new Date() }, ...(options.workspaceId ? { variant: { post: { workspaceId: options.workspaceId } } } : {}) },
    include: { variant: { select: { post: { select: { workspaceId: true } } } } }, take: 10 });
  for (const job of expired) await prisma.$transaction(async tx => {
    const uncertain = !!job.dispatchStartedAt && !job.externalPostId;
    const status = uncertain ? "needs_reconciliation" : job.externalPostId ? "verifying" : "retry_wait";
    const changed = await tx.socialPublishJob.updateMany({ where: { id: job.id, leaseToken: job.leaseToken, status: "processing", lockedUntil: { lt: new Date() } }, data: { status, lockedUntil: null, leaseToken: null, nextAttemptAt: new Date(), lastErrorCode: uncertain ? "ambiguous_worker_interrupted" : "retryable_worker_interrupted", lastErrorMessage: "Previous worker stopped before recording completion." } });
    if (!changed.count) return;
    await tx.socialPublishAttempt.updateMany({ where: { jobId: job.id, status: "started" }, data: { status: "interrupted", providerCode: "worker_interrupted" } });
    if (uncertain) {
      await tx.socialPostVariant.updateMany({ where: { id: job.variantId, revision: job.revision, status: "publishing" }, data: { status: "failed" } });
      await notify(tx, job.variant.post.workspaceId, job.id, status);
    }
    await tx.auditEvent.create({ data: { workspaceId: job.variant.post.workspaceId, action: "social.job.lease_expired", subjectType: "SocialPublishJob", subjectId: job.id, summary: "Expired worker lease recovered without repeating an uncertain publish", metadata: { status } } });
  });
}
async function claimJob(options: WorkerOptions) {
  return prisma.$transaction(async tx => {
    const job = await tx.socialPublishJob.findFirst({ where: { mode: options.mode, status: { in: runnable }, nextAttemptAt: { lte: new Date() }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }], ...(options.workspaceId ? { variant: { post: { workspaceId: options.workspaceId } } } : {}) }, orderBy: { nextAttemptAt: "asc" },
      include: { variant: { include: { post: true, approvals: { where: { revokedAt: null } } } } } });
    if (!job) return null;
    const leaseToken = randomUUID();
    const updated = await tx.socialPublishJob.updateMany({ where: { id: job.id, status: job.status, attemptsCount: job.attemptsCount, OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }] }, data: { status: "processing", leaseToken, lockedUntil: new Date(Date.now() + LEASE_MS), attemptsCount: { increment: 1 } } });
    if (updated.count !== 1) return null;
    await tx.socialPublishAttempt.create({ data: { jobId: job.id, attempt: job.attemptsCount + 1, status: "started" } });
    return { ...job, leaseToken, attemptsCount: job.attemptsCount + 1 };
  });
}
async function finish(job: NonNullable<JobContext>, input: { status: string; variantStatus?: string; code?: string; message?: string; state?: Record<string, unknown>; externalId?: string; retryAt?: Date; dispatchRejected?: boolean }) {
  return prisma.$transaction(async tx => {
    const changed = await tx.socialPublishJob.updateMany({ where: { id: job.id, status: "processing", leaseToken: job.leaseToken }, data: {
      status: input.status, lockedUntil: null, leaseToken: null, nextAttemptAt: input.retryAt ?? null,
      lastErrorCode: input.code ?? null, lastErrorMessage: input.message ?? null,
      ...(input.dispatchRejected ? { dispatchStartedAt: null } : {}), ...(input.state ? { providerState: json(input.state) } : {}), ...(input.externalId ? { externalPostId: input.externalId } : {})
    } });
    if (!changed.count) return false; // Fencing: a stale worker cannot overwrite another result.
    await tx.socialPublishAttempt.updateMany({ where: { jobId: job.id, attempt: job.attemptsCount, status: "started" }, data: { status: input.status, providerCode: input.code, errorMessage: input.message, externalId: input.externalId } });
    if (input.variantStatus) await tx.socialPostVariant.updateMany({ where: { id: job.variantId, revision: job.revision, status: { in: ["scheduled", "publishing"] } }, data: { status: input.variantStatus, ...(input.status === "simulated" ? { scheduledAt: null } : {}) } });
    if (["failed", "needs_reconciliation", "needs_reauthorization"].includes(input.status)) await notify(tx, job.variant.post.workspaceId, job.id, input.status);
    await tx.auditEvent.create({ data: { workspaceId: job.variant.post.workspaceId, action: "social.job." + input.status, subjectType: "SocialPublishJob", subjectId: job.id,
      summary: "Social job " + input.status, metadata: { mode: job.mode, attempt: job.attemptsCount, revision: job.revision, externalId: input.externalId ?? null, code: input.code ?? null } } });
    return true;
  });
}
function privateMediaUrl(key: string) {
  return presignR2Object({ accountId: process.env.R2_ACCOUNT_ID ?? "", accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "", bucket: process.env.R2_BUCKET_NAME ?? "", key, method: "GET", expiresSeconds: 900 });
}
async function runClaimedJob(job: NonNullable<JobContext>) {
  let dispatching = false;
  try {
    const snapshot = readSocialSnapshot(job.snapshot);
    if (snapshot.workspaceId !== job.variant.post.workspaceId || snapshot.variantId !== job.variantId || snapshot.revision !== job.revision || snapshot.platform !== job.variant.platform ||
        !["scheduled", "publishing"].includes(job.variant.status) || job.variant.revision !== job.revision || snapshot.caption !== job.variant.caption || JSON.stringify(snapshot.media) !== JSON.stringify(job.variant.media ?? []) || !job.variant.approvals.some(a => a.revision === job.revision)) throw new SocialProviderError("permanent", "approval_or_snapshot_changed");
    if (job.externalPostId && job.mode !== "live") throw new SocialProviderError("permanent", "invalid_simulation_state");
    if (job.mode === "dry_run") {
      // Absolutely no token decryption, storage reads, or provider network calls in simulation.
      await finish(job, { status: "simulated", variantStatus: "approved", state: { checkedRevision: job.revision, simulated: true } });
      return "simulated";
    }
    if (!liveSocialPublishingEnabled() || process.env["SOCIAL_" + snapshot.platform.toUpperCase() + "_ADAPTER_VERIFIED"] !== "true") throw new SocialProviderError("permanent", "activation_disabled");
    const contentProblem = liveSocialContentProblem(snapshot);
    if (contentProblem) throw new SocialProviderError("permanent", "unsupported_content");
    const connection = job.connectionId ? await prisma.socialChannelConnection.findFirst({ where: { id: job.connectionId, workspaceId: snapshot.workspaceId, platform: snapshot.platform, publishingEnabled: true, status: "connected" }, include: { vault: true } }) : null;
    if (!connection?.vault || (connection.expiresAt && connection.expiresAt <= new Date())) throw new SocialProviderError("reauthorize", "connection_unavailable");
    const scopes = Array.isArray(connection.scopes) ? connection.scopes : [];
    const required = snapshot.platform === "facebook" ? ["pages_manage_posts", "pages_read_engagement"] : snapshot.platform === "instagram" ? ["instagram_basic", "instagram_content_publish"] : [connection.providerAccountId.startsWith("urn:li:organization:") ? "w_organization_social" : "w_member_social"];
    if (!required.every(scope => scopes.includes(scope))) throw new SocialProviderError("reauthorize", "missing_scope");
    const grant = openSocialConnection(connection.vault.encodedData, snapshot.workspaceId, connection.id);
    if (typeof grant.accessToken !== "string" || !grant.accessToken) throw new SocialProviderError("reauthorize", "invalid_vault_grant");
    const state = job.providerState && typeof job.providerState === "object" && !Array.isArray(job.providerState) ? job.providerState as Record<string, unknown> : {};
    const context: ProviderContext = { snapshot, accountId: connection.providerAccountId, accessToken: grant.accessToken, mediaUrl: privateMediaUrl, state };
    const adapter = socialProviderAdapter(snapshot.platform);
    if (job.externalPostId) {
      if (await adapter.verify(context, job.externalPostId)) {
        await finish(job, { status: "published", variantStatus: "published", externalId: job.externalPostId }); return "published";
      }
      if (job.attemptsCount >= 30) throw new SocialProviderError("ambiguous", "verification_timeout");
      await finish(job, { status: "verifying", retryAt: new Date(Date.now() + 60000) }); return "verifying";
    }
    if (job.dispatchStartedAt) throw new SocialProviderError("ambiguous", "previous_dispatch_unresolved");
    if (state.prepared !== true) {
      const prepared = await adapter.prepare(context);
      if (job.attemptsCount >= 30 && !prepared.ready) throw new SocialProviderError("permanent", "media_processing_timeout");
      await finish(job, { status: "preparing", state: { ...prepared.state, prepared: prepared.ready }, retryAt: new Date(Date.now() + (prepared.ready ? 0 : 60000)) });
      return "preparing"; // Persist provider media IDs before the publishing step.
    }
    // Commit intent before the non-idempotent external POST. A crash now requires reconciliation.
    const marked = await prisma.$transaction(async tx => {
      const changed = await tx.socialPublishJob.updateMany({ where: { id: job.id, status: "processing", leaseToken: job.leaseToken, dispatchStartedAt: null, externalPostId: null }, data: { dispatchStartedAt: new Date() } });
      if (!changed.count) return false;
      const variant = await tx.socialPostVariant.updateMany({ where: { id: job.variantId, revision: job.revision, status: { in: ["scheduled", "publishing"] } }, data: { status: "publishing" } });
      if (variant.count !== 1) throw new SocialProviderError("permanent", "content_no_longer_scheduled");
      return true;
    });
    if (!marked) return "lease_lost";
    if (!liveSocialPublishingEnabled()) throw new SocialProviderError("permanent", "activation_disabled");
    dispatching = true;
    const externalId = await adapter.publish(context);
    await finish(job, { status: "verifying", externalId, retryAt: new Date(Date.now() + 30000) });
    return "verifying";
  } catch (error) {
    const problem = error instanceof SocialProviderError ? error : new SocialProviderError(dispatching ? "ambiguous" : "permanent", "internal_failure");
    const uncertain = problem.kind === "ambiguous" || !!job.externalPostId;
    const retryable = problem.kind === "retryable" && !uncertain;
    const status = uncertain ? "needs_reconciliation" : problem.kind === "reauthorize" ? "needs_reauthorization" : retryable && job.attemptsCount < 5 ? "retry_wait" : "failed";
    const code = (problem.kind === "reauthorize" || retryable ? "retryable_" : problem.kind + "_") + problem.code;
    await finish(job, { status, variantStatus: ["failed", "needs_reauthorization", "needs_reconciliation"].includes(status) ? status === "needs_reauthorization" ? "needs_reauthorization" : "failed" : undefined,
      code, message: uncertain ? "Publication outcome is uncertain. Reconcile the provider post before retrying." : "Publishing stopped: " + code,
      retryAt: status === "retry_wait" ? socialRetryAt(job.attemptsCount, Date.now(), problem.retryAfterSeconds) : undefined,
      dispatchRejected: !uncertain });
    return status;
  }
}

/** Bounded server worker. Concurrent invocations use database leases and attempt uniqueness. */
export async function runSocialPublishingWorker(options: WorkerOptions) {
  if (options.mode === "live" && !liveSocialPublishingEnabled()) return { disabled: true, processed: 0, results: [] as string[] };
  if (options.mode === "dry_run" && process.env.VERCEL_ENV !== "preview" && process.env.NODE_ENV !== "test") throw new Error("Simulation requires Preview");
  await recoverExpiredJobs(options);
  const results: string[] = [];
  const deadline = Date.now() + 40000;
  for (let i = 0; i < Math.min(5, Math.max(1, options.limit ?? 3)) && Date.now() < deadline; i++) {
    const job = await claimJob(options);
    if (!job) break;
    results.push(await runClaimedJob(job));
  }
  return { disabled: false, processed: results.length, results };
}
