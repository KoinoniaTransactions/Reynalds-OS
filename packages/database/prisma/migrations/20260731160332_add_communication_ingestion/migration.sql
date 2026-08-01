-- CreateTable
CREATE TABLE "Communication" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalMessageId" TEXT NOT NULL,
    "externalThreadId" TEXT,
    "workItemId" TEXT,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "recipients" JSONB,
    "sentAt" TIMESTAMP(3),
    "snippet" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "sourceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'imported',
    "matchConfidence" INTEGER,
    "matchEvidence" JSONB,
    "identifiers" JSONB,
    "location" JSONB,
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Communication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationAttachment" (
    "id" TEXT NOT NULL,
    "communicationId" TEXT NOT NULL,
    "externalAttachmentId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "sourceUrl" TEXT,
    "storageUrl" TEXT,
    "checksum" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationReviewItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "communicationId" TEXT NOT NULL,
    "suggestedWorkItemId" TEXT,
    "category" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "confidence" INTEGER,
    "evidence" JSONB,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportCheckpoint" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "mailbox" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "cursor" TEXT,
    "historyId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'idle',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Communication_workspaceId_workItemId_idx" ON "Communication"("workspaceId", "workItemId");

-- CreateIndex
CREATE INDEX "Communication_workspaceId_status_idx" ON "Communication"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Communication_externalThreadId_idx" ON "Communication"("externalThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "Communication_workspaceId_source_externalMessageId_key" ON "Communication"("workspaceId", "source", "externalMessageId");

-- CreateIndex
CREATE INDEX "CommunicationAttachment_communicationId_idx" ON "CommunicationAttachment"("communicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationAttachment_communicationId_externalAttachmentI_key" ON "CommunicationAttachment"("communicationId", "externalAttachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationReviewItem_communicationId_key" ON "CommunicationReviewItem"("communicationId");

-- CreateIndex
CREATE INDEX "CommunicationReviewItem_workspaceId_status_idx" ON "CommunicationReviewItem"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "CommunicationReviewItem_suggestedWorkItemId_idx" ON "CommunicationReviewItem"("suggestedWorkItemId");

-- CreateIndex
CREATE INDEX "ImportCheckpoint_workspaceId_source_idx" ON "ImportCheckpoint"("workspaceId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "ImportCheckpoint_workspaceId_source_mailbox_label_key" ON "ImportCheckpoint"("workspaceId", "source", "mailbox", "label");

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Communication" ADD CONSTRAINT "Communication_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "RosObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationAttachment" ADD CONSTRAINT "CommunicationAttachment_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationReviewItem" ADD CONSTRAINT "CommunicationReviewItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationReviewItem" ADD CONSTRAINT "CommunicationReviewItem_communicationId_fkey" FOREIGN KEY ("communicationId") REFERENCES "Communication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationReviewItem" ADD CONSTRAINT "CommunicationReviewItem_suggestedWorkItemId_fkey" FOREIGN KEY ("suggestedWorkItemId") REFERENCES "RosObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportCheckpoint" ADD CONSTRAINT "ImportCheckpoint_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
