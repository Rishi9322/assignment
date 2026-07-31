-- CreateTable
CREATE TABLE "Contact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "team" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dueAt" DATETIME,
    "firstRespondedAt" DATETIME,
    "resolvedAt" DATETIME,
    "reopenCount" INTEGER NOT NULL DEFAULT 0,
    "nextAction" TEXT,
    "createdByUserId" INTEGER NOT NULL,
    "assignedToUserId" INTEGER,
    "vendorId" INTEGER,
    "contactId" INTEGER,
    CONSTRAINT "Ticket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ticket_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("assignedToUserId", "createdAt", "createdByUserId", "customerEmail", "customerName", "description", "dueAt", "firstRespondedAt", "id", "nextAction", "priority", "reopenCount", "resolvedAt", "status", "subject", "team", "ticketId", "updatedAt", "vendorId") SELECT "assignedToUserId", "createdAt", "createdByUserId", "customerEmail", "customerName", "description", "dueAt", "firstRespondedAt", "id", "nextAction", "priority", "reopenCount", "resolvedAt", "status", "subject", "team", "ticketId", "updatedAt", "vendorId" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
CREATE UNIQUE INDEX "Ticket_ticketId_key" ON "Ticket"("ticketId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");
