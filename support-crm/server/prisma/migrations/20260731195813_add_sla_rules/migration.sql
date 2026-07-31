-- CreateTable
CREATE TABLE "SlaRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "priority" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SlaRule_priority_key" ON "SlaRule"("priority");
