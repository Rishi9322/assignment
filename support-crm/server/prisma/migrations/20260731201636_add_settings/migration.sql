-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "orgName" TEXT NOT NULL DEFAULT 'Support CRM',
    "supportEmail" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#2563eb',
    "statusLabels" TEXT NOT NULL DEFAULT '{}',
    "priorityLabels" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);
