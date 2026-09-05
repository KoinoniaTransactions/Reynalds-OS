-- Extend document records so portal uploads can be owned, audited, and reviewed safely.
ALTER TABLE "Document" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "Document" ADD COLUMN "uploadedByUserId" TEXT;
ALTER TABLE "Document" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "Document" ADD COLUMN "fileSizeBytes" INTEGER;
ALTER TABLE "Document" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "Document" ADD COLUMN "requestedAction" TEXT;
ALTER TABLE "Document" ADD COLUMN "notes" TEXT;
ALTER TABLE "Document" ADD COLUMN "accessLevel" TEXT NOT NULL DEFAULT 'client_and_staff';
ALTER TABLE "Document" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Document" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Document_workspaceId_status_idx" ON "Document"("workspaceId", "status");
CREATE INDEX "Document_workspaceId_ownerId_idx" ON "Document"("workspaceId", "ownerId");
CREATE INDEX "Document_workspaceId_documentType_idx" ON "Document"("workspaceId", "documentType");
CREATE INDEX "Document_relatedObjectId_idx" ON "Document"("relatedObjectId");
