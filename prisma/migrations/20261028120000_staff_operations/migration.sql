ALTER TABLE "AdminUser" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "inviteHash" TEXT, ADD COLUMN "inviteExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "AdminUser_inviteHash_key" ON "AdminUser"("inviteHash");
CREATE TABLE "SupportTask" ("id" TEXT NOT NULL PRIMARY KEY, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "assignedTo" TEXT, "followUpAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "SupportTask_entityType_entityId_key" ON "SupportTask"("entityType", "entityId");
CREATE TABLE "SupportEntry" ("id" TEXT NOT NULL PRIMARY KEY, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "adminUserId" TEXT NOT NULL, "authorName" TEXT NOT NULL, "kind" TEXT NOT NULL, "body" TEXT NOT NULL, "subject" TEXT, "recipient" TEXT, "status" TEXT NOT NULL DEFAULT 'SAVED', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "SupportEntry_entityType_entityId_createdAt_idx" ON "SupportEntry"("entityType", "entityId", "createdAt");
