-- CreateTable
CREATE TABLE "GmailConnection" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountEmail" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "scopes" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastConnectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GmailConnection_workspaceId_accountEmail_key" ON "GmailConnection"("workspaceId", "accountEmail");

-- CreateIndex
CREATE INDEX "GmailConnection_workspaceId_status_idx" ON "GmailConnection"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "GmailConnection" ADD CONSTRAINT "GmailConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
