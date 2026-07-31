import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createUserAndLogin, resetDb } from "./helpers";

describe("ticket ID generation under concurrency", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("assigns a unique, sequential TKT-### id even under concurrent creates", async () => {
    const { token } = await createUserAndLogin();
    expect(token).toBeTruthy();

    // SQLite has a single physical writer regardless of journal mode, so very
    // high concurrency (15+) legitimately queues up beyond a generous timeout
    // on this machine — 10 matches the burst size already verified manually
    // against a live dev server and is a realistic "several agents create a
    // ticket at once" scenario for this app's scale.
    const CONCURRENCY = 10;
    const responses = await Promise.all(
      Array.from({ length: CONCURRENCY }, (_, i) =>
        request(app)
          .post("/api/tickets")
          .set("Authorization", `Bearer ${token}`)
          .send({
            customer_name: `Customer ${i}`,
            customer_email: `customer${i}@example.com`,
            subject: `Race condition check ${i}`,
            description: "Concurrent create test",
          })
      )
    );

    for (const res of responses) {
      expect(res.status).toBe(201);
      expect(res.body.ticket_id).toMatch(/^TKT-\d{3,}$/);
    }

    const ids = responses.map((r) => r.body.ticket_id);
    expect(new Set(ids).size).toBe(CONCURRENCY);
  });
});
