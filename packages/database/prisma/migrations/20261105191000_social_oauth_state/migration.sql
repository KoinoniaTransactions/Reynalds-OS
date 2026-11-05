CREATE TABLE "SocialOAuthState" (
  "stateHash" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SocialOAuthState_pkey" PRIMARY KEY ("stateHash")
);
CREATE INDEX "SocialOAuthState_expiresAt_idx" ON "SocialOAuthState"("expiresAt");
CREATE INDEX "SocialOAuthState_workspaceId_platform_idx" ON "SocialOAuthState"("workspaceId", "platform");
