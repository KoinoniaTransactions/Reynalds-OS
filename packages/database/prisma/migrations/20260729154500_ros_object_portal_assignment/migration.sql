ALTER TABLE "RosObject" ADD COLUMN "clientUserId" TEXT;
ALTER TABLE "RosObject" ADD COLUMN "clientObjectId" TEXT;
ALTER TABLE "RosObject" ADD COLUMN "assignedStaffUserId" TEXT;
ALTER TABLE "RosObject" ADD COLUMN "backupStaffUserId" TEXT;

CREATE INDEX "RosObject_workspaceId_clientUserId_idx" ON "RosObject"("workspaceId", "clientUserId");
CREATE INDEX "RosObject_workspaceId_clientObjectId_idx" ON "RosObject"("workspaceId", "clientObjectId");
CREATE INDEX "RosObject_workspaceId_assignedStaffUserId_idx" ON "RosObject"("workspaceId", "assignedStaffUserId");
CREATE INDEX "RosObject_workspaceId_backupStaffUserId_idx" ON "RosObject"("workspaceId", "backupStaffUserId");
