-- Store verified Resend contact webhook events exactly once per Svix delivery ID.
-- CRM updates must be transactionally coupled to this ledger before activation.
CREATE TABLE "ResendContactWebhookEvent" (
  "id" TEXT NOT NULL,
  "svixId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "resendContactId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "eventOccurredAt" TIMESTAMP(3) NOT NULL,
  "relationshipId" TEXT,
  "outcome" TEXT NOT NULL,
  CONSTRAINT "ResendContactWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResendContactWebhookEvent_svixId_key" ON "ResendContactWebhookEvent"("svixId");
CREATE INDEX "ResendContactWebhookEvent_workspaceId_resendContactId_idx" ON "ResendContactWebhookEvent"("workspaceId","resendContactId");
CREATE INDEX "ResendContactWebhookEvent_workspaceId_createdAt_idx" ON "ResendContactWebhookEvent"("workspaceId","createdAt");
ALTER TABLE "ResendContactWebhookEvent" ADD CONSTRAINT "ResendContactWebhookEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
