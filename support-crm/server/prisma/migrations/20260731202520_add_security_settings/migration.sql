-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "orgName" TEXT NOT NULL DEFAULT 'Support CRM',
    "supportEmail" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#2563eb',
    "statusLabels" TEXT NOT NULL DEFAULT '{}',
    "priorityLabels" TEXT NOT NULL DEFAULT '{}',
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 10080,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutMinutes" INTEGER NOT NULL DEFAULT 15,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("accentColor", "id", "orgName", "priorityLabels", "statusLabels", "supportEmail", "updatedAt") SELECT "accentColor", "id", "orgName", "priorityLabels", "statusLabels", "supportEmail", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Agent',
    "team" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME
);
INSERT INTO "new_User" ("active", "createdAt", "email", "id", "name", "passwordHash", "role", "team") SELECT "active", "createdAt", "email", "id", "name", "passwordHash", "role", "team" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
