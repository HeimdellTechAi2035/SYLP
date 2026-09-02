-- CreateTable
CREATE TABLE "UnansweredQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "askCount" INTEGER NOT NULL DEFAULT 1,
    "lastAskedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedFaqId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnansweredQuestion_resolvedFaqId_fkey" FOREIGN KEY ("resolvedFaqId") REFERENCES "FaqItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UnansweredQuestion_question_key" ON "UnansweredQuestion"("question");
