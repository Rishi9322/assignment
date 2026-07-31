import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app, createUserAndLogin, resetDb } from "./helpers";
import { prisma } from "../src/config/prisma";

const createTicket = async (token: string) => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Authorization", `Bearer ${token}`)
    .send({
      customer_name: "Jane Doe",
      customer_email: "jane@example.com",
      subject: "Ownership rule test",
      description: "desc",
    });
  return res.body.ticket_id as string;
};

describe("single-ownership rule (employee XOR vendor)", () => {
  let token: string;

  beforeEach(async () => {
    await resetDb();
    const auth = await createUserAndLogin();
    token = auth.token!;
  });

  it("rejects setting both an employee and a vendor in the same request", async () => {
    const ticketId = await createTicket(token);
    const employee = await createUserAndLogin();
    const vendor = await prisma.vendor.create({
      data: { name: "Acme Vendor", type: "Fixed" },
    });

    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ assigned_to_user_id: employee.user.id, vendor_id: vendor.id });

    expect(res.status).toBe(400);
  });

  it("auto-clears the vendor when an employee is explicitly assigned afterward", async () => {
    const ticketId = await createTicket(token);
    const employee = await createUserAndLogin();
    const vendor = await prisma.vendor.create({
      data: { name: "Acme Vendor", type: "Fixed" },
    });

    // First assign the vendor.
    const first = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ vendor_id: vendor.id });
    expect(first.status).toBe(200);

    // Then assign the employee without mentioning the vendor — vendor should clear.
    const second = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ assigned_to_user_id: employee.user.id });
    expect(second.status).toBe(200);

    const detail = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.body.assigned_to?.id).toBe(employee.user.id);
    expect(detail.body.vendor).toBeNull();
  });
});
