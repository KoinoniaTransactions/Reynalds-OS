-- Add one lifecycle state for consistent document visibility and workflow rules.
ALTER TABLE "Document"
ADD COLUMN "lifecycleState" TEXT NOT NULL DEFAULT 'active';

UPDATE "Document"
SET "lifecycleState" =
  CASE
    WHEN "removedAt" IS NOT NULL THEN 'removed'
    WHEN "archivedAt" IS NOT NULL OR "status" = 'Archived' THEN 'archived'
    WHEN "supersededAt" IS NOT NULL OR "status" = 'Superseded' THEN 'superseded'
    ELSE 'active'
  END;

CREATE INDEX "Document_workspaceId_lifecycleState_idx"
ON "Document"("workspaceId", "lifecycleState");
