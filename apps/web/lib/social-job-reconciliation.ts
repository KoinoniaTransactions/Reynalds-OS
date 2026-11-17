import { prisma } from "./db";
import { openSocialConnection } from "./social-connection-vault";
import { socialProviderAdapter } from "./social-provider-adapters";
import { readSocialSnapshot } from "./social-queue-policy";
import { SocialQueueError, type SocialQueueActor } from "./social-queue";

/** Read-only provider verification followed by a fenced local resolution. Never publishes or retries. */
export async function reconcileSocialJob(actor: SocialQueueActor, jobId: string, externalId: string, acknowledged: boolean) {
  if (actor.role !== "Owner") throw new SocialQueueError("Owner permission required", 403);
  if (!acknowledged || !/^[\w:()-]{1,200}$/.test(externalId)) throw new SocialQueueError("Confirm the provider post belongs to this job and enter its post ID", 400);
  const job = await prisma.socialPublishJob.findFirst({ where: { id: jobId, variant: { post: { workspaceId: actor.workspaceId } } }, include: { variant: true } });
  if (!job) throw new SocialQueueError("Job not found", 404);
  if (job.mode !== "live" || job.status !== "needs_reconciliation" || !job.connectionId || (job.externalPostId && job.externalPostId !== externalId) || (job.lockedUntil && job.lockedUntil > new Date())) throw new SocialQueueError("This job cannot be reconciled with that post ID");
  const snapshot = readSocialSnapshot(job.snapshot);
  if (snapshot.workspaceId !== actor.workspaceId || snapshot.variantId !== job.variantId || snapshot.revision !== job.revision) throw new SocialQueueError("Job snapshot does not match this workspace");
  const connection = await prisma.socialChannelConnection.findFirst({ where: { id: job.connectionId, workspaceId: actor.workspaceId, platform: snapshot.platform, status: "connected" }, include: { vault: true } });
  if (!connection?.vault || (connection.expiresAt && connection.expiresAt <= new Date())) throw new SocialQueueError("Reconnect the original account to verify this post");
  const grant = openSocialConnection(connection.vault.encodedData, actor.workspaceId, connection.id);
  if (typeof grant.accessToken !== "string" || !grant.accessToken) throw new SocialQueueError("Account authorization is unavailable");
  const verified = await socialProviderAdapter(snapshot.platform).verify({ snapshot, accountId: connection.providerAccountId, accessToken: grant.accessToken,
    mediaUrl: () => { throw new Error("Reconciliation must not retrieve media or publish"); }, state: {} }, externalId);
  if (!verified) throw new SocialQueueError("Provider post does not match the original account and approved caption");
  return prisma.$transaction(async tx => {
    const changed = await tx.socialPublishJob.updateMany({ where: { id: job.id, status: "needs_reconciliation", externalPostId: job.externalPostId, OR: [{ lockedUntil: null }, { lockedUntil: { lt: new Date() } }] },
      data: { status: "published", externalPostId: externalId, lockedUntil: null, leaseToken: null, nextAttemptAt: null, lastErrorCode: null, lastErrorMessage: null } });
    if (changed.count !== 1) throw new SocialQueueError("Job changed while verifying; refresh its history");
    await tx.socialPostVariant.updateMany({ where: { id: job.variantId, revision: job.revision, status: { in: ["failed", "publishing"] } }, data: { status: "published" } });
    await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.job.reconciled", subjectType: "SocialPublishJob", subjectId: job.id,
      summary: "Owner confirmed an existing provider post; account and approved caption verified without redispatch", metadata: { externalId, revision: job.revision, ownerAcknowledged: true } } });
    return { saved: true, status: "published", externalId };
  });
}
