-- Additive only. Existing jobs intentionally have no snapshot and cannot dispatch.
ALTER TABLE "SocialChannelConnection" ADD COLUMN "publishingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SocialPublishJob"
  ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN "snapshot" JSONB,
  ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'America/Denver',
  ADD COLUMN "queuedById" TEXT,
  ADD COLUMN "connectionId" TEXT,
  ADD COLUMN "nextAttemptAt" TIMESTAMP(3),
  ADD COLUMN "leaseToken" TEXT,
  ADD COLUMN "dispatchStartedAt" TIMESTAMP(3),
  ADD COLUMN "providerState" JSONB,
  ADD COLUMN "lastErrorCode" TEXT,
  ADD COLUMN "lastErrorMessage" TEXT;
CREATE INDEX "SocialPublishJob_mode_status_nextAttemptAt_idx" ON "SocialPublishJob"("mode", "status", "nextAttemptAt");
