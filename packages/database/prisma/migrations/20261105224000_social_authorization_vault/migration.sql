CREATE TABLE "SocialConnectionVault" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "connectionId" TEXT NOT NULL,
  "encodedData" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialConnectionVault_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialConnectionVault_connectionId_key" ON "SocialConnectionVault"("connectionId");
CREATE INDEX "SocialConnectionVault_workspaceId_idx" ON "SocialConnectionVault"("workspaceId");
CREATE TABLE "SocialAuthorization" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "nonceHash" TEXT NOT NULL,
  "payload" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialAuthorization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SocialAuthorization_nonceHash_key" ON "SocialAuthorization"("nonceHash");
CREATE INDEX "SocialAuthorization_workspaceId_platform_idx" ON "SocialAuthorization"("workspaceId","platform");
CREATE INDEX "SocialAuthorization_expiresAt_idx" ON "SocialAuthorization"("expiresAt");
ALTER TABLE "SocialConnectionVault" ADD CONSTRAINT "SocialConnectionVault_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "SocialChannelConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
