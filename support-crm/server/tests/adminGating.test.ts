import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createUserAndLogin, resetDb } from "./helpers";

describe("admin route gating", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects a non-admin agent with 403", async () => {
    const { token } = await createUserAndLogin({ role: "Agent" });

    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("allows an admin through", async () => {
    const { token } = await createUserAndLogin({ role: "Admin" });

    const res = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rejects requests with no token at all", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("blocks an admin from deactivating or promoting themselves", async () => {
    const { token, user } = await createUserAndLogin({ role: "Admin" });

    const res = await request(app)
      .patch(`/api/admin/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ active: false });

    expect(res.status).toBe(400);
  });

  it("revokes access on the very next request after deactivation, not just future logins", async () => {
    const admin = await createUserAndLogin({ role: "Admin" });
    const target = await createUserAndLogin({ role: "Agent" });

    // The agent's token is valid before deactivation.
    const before = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${target.token}`);
    expect(before.status).toBe(200);

    const deactivate = await request(app)
      .patch(`/api/admin/users/${target.user.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ active: false });
    expect(deactivate.status).toBe(200);

    // Same (still-unexpired) token must now be rejected — deactivation isn't
    // just a login-time check, it's re-verified per request.
    const after = await request(app)
      .get("/api/tickets")
      .set("Authorization", `Bearer ${target.token}`);
    expect(after.status).toBe(401);
  });
});
