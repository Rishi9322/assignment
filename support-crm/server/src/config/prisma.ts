import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// WAL mode lets SQLite readers proceed without blocking on the single writer,
// which matters a lot under concurrent ticket creates (each is a short
// interactive transaction) — the default rollback-journal mode serializes far
// more aggressively and was timing out real concurrent-write bursts.
export const dbReady = prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");
