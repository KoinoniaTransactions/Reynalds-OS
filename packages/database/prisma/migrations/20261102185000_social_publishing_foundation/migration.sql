-- Social publishing content foundation. No outbound network requests, secrets or live posting.
CREATE TABLE "SocialChannelConnection" (
 "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "platform" TEXT NOT NULL,
 "providerAccountId" TEXT NOT NULL, "displayName" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'disconnected', "scopes" JSONB,
 "connectedAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SocialChannelConnection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialChannelConnection_workspaceId_platform_providerAccountId_key" ON "SocialChannelConnection"("workspaceId", "platform", "providerAccountId");
CREATE INDEX "SocialChannelConnection_workspaceId_status_idx" ON "SocialChannelConnection"("workspaceId", "status");
ALTER TABLE "SocialChannelConnection" ADD CONSTRAINT "SocialChannelConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SocialPost" (
 "id" TEXT NOT NULL, "workspaceId" TEXT NOT NULL, "title" TEXT NOT NULL,
 "campaignKey" TEXT, "createdById" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'draft',
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialPost_workspaceId_createdAt_idx" ON "SocialPost"("workspaceId", "createdAt");
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "SocialPostVariant" (
 "id" TEXT NOT NULL, "postId" TEXT NOT NULL, "connectionId" TEXT, "platform" TEXT NOT NULL,
 "caption" TEXT NOT NULL, "media" JSONB, "revision" INTEGER NOT NULL DEFAULT 1,
 "status" TEXT NOT NULL DEFAULT 'draft', "scheduledAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SocialPostVariant_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialPostVariant_postId_platform_idx" ON "SocialPostVariant"("postId", "platform");
CREATE INDEX "SocialPostVariant_connectionId_status_idx" ON "SocialPostVariant"("connectionId", "status");
ALTER TABLE "SocialPostVariant" ADD CONSTRAINT "SocialPostVariant_postId_fkey" FOREIGN KEY ("postId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPostVariant" ADD CONSTRAINT "SocialPostVariant_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "SocialChannelConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SocialApproval" (
 "id" TEXT NOT NULL, "variantId" TEXT NOT NULL, "revision" INTEGER NOT NULL,
 "approvedById" TEXT NOT NULL, "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "revokedAt" TIMESTAMP(3), CONSTRAINT "SocialApproval_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SocialApproval_variantId_revision_idx" ON "SocialApproval"("variantId", "revision");
ALTER TABLE "SocialApproval" ADD CONSTRAINT "SocialApproval_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "SocialPostVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SocialPublishJob" (
 "id" TEXT NOT NULL, "variantId" TEXT NOT NULL, "revision" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'scheduled', "scheduledAt" TIMESTAMP(3) NOT NULL,
 "idempotencyKey" TEXT NOT NULL, "externalPostId" TEXT, "lockedUntil" TIMESTAMP(3),
 "attemptsCount" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SocialPublishJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialPublishJob_idempotencyKey_key" ON "SocialPublishJob"("idempotencyKey");
CREATE INDEX "SocialPublishJob_status_scheduledAt_idx" ON "SocialPublishJob"("status", "scheduledAt");
CREATE INDEX "SocialPublishJob_variantId_revision_idx" ON "SocialPublishJob"("variantId", "revision");
ALTER TABLE "SocialPublishJob" ADD CONSTRAINT "SocialPublishJob_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "SocialPostVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SocialPublishAttempt" (
 "id" TEXT NOT NULL, "jobId" TEXT NOT NULL, "attempt" INTEGER NOT NULL,
 "status" TEXT NOT NULL, "providerCode" TEXT, "errorMessage" TEXT,
 "externalId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SocialPublishAttempt_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialPublishAttempt_jobId_attempt_key" ON "SocialPublishAttempt"("jobId", "attempt");
ALTER TABLE "SocialPublishAttempt" ADD CONSTRAINT "SocialPublishAttempt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SocialPublishJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
