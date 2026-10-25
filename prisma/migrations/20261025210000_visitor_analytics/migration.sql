CREATE TABLE "TrafficVisit" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "TrafficPageView" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "visitId" TEXT NOT NULL REFERENCES "TrafficVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "path" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "TrafficPageView_createdAt_idx" ON "TrafficPageView"("createdAt");
CREATE INDEX "TrafficPageView_visitId_createdAt_idx" ON "TrafficPageView"("visitId", "createdAt");
