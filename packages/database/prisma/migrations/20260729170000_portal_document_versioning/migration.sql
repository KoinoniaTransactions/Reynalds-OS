-- Add document version-chain fields so replacements preserve prior files and audit context.
ALTER TABLE "Document" ADD COLUMN "versionNumber" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Document" ADD COLUMN "versionLabel" TEXT;
ALTER TABLE "Document" ADD COLUMN "previousDocumentId" TEXT;
ALTER TABLE "Document" ADD COLUMN "supersededByDocumentId" TEXT;
ALTER TABLE "Document" ADD COLUMN "replacementReason" TEXT;
ALTER TABLE "Document" ADD COLUMN "supersededAt" TIMESTAMP(3);

CREATE INDEX "Document_workspaceId_previousDocumentId_idx" ON "Document"("workspaceId", "previousDocumentId");
CREATE INDEX "Document_workspaceId_supersededByDocumentId_idx" ON "Document"("workspaceId", "supersededByDocumentId");
