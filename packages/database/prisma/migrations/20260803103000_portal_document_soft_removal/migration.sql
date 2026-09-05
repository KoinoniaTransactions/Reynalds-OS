-- Preserve removed portal documents for version history, restoration, and audit review.
ALTER TABLE "Document"
ADD COLUMN "removedAt" TIMESTAMP(3),
ADD COLUMN "removedByUserId" TEXT,
ADD COLUMN "removalReason" TEXT;

CREATE INDEX "Document_workspaceId_removedAt_idx"
ON "Document"("workspaceId", "removedAt");
