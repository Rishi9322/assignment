import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

export default function setup() {
  const dbPath = path.resolve(__dirname, "../prisma/test.db");
  if (existsSync(dbPath)) unlinkSync(dbPath);
  const journalPath = `${dbPath}-journal`;
  if (existsSync(journalPath)) unlinkSync(journalPath);

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
    stdio: "inherit",
  });
}
