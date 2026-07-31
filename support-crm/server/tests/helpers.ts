import request from "supertest";
import { app } from "../src/app";
import { prisma, dbReady } from "../src/config/prisma";
import { hashPassword } from "../src/utils/password";

export const resetDb = async () => {
  await dbReady;
  await prisma.ticketEvent.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.passkey.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
};

let counter = 0;
const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${counter++}@test.local`;

export const createUserAndLogin = async (
  overrides: { role?: "Admin" | "Agent"; active?: boolean; name?: string } = {}
) => {
  const email = uniqueEmail(overrides.role === "Admin" ? "admin" : "agent");
  const passwordHash = await hashPassword("password123");
  const user = await prisma.user.create({
    data: {
      name: overrides.name ?? "Test User",
      email,
      passwordHash,
      role: overrides.role ?? "Agent",
      active: overrides.active ?? true,
    },
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email,
    password: "password123",
  });

  return { user, token: loginRes.body.token as string | undefined, loginRes };
};

export { app };
