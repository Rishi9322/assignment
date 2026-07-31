import { PrismaClient } from "@prisma/client";
import { formatTicketId } from "../src/utils/ticketId";
import { hashPassword } from "../src/utils/password";
import { computeDueAt, DEFAULT_SLA_HOURS_BY_PRIORITY } from "../src/utils/sla";
import { TEAMS } from "../src/types/ticket";

const prisma = new PrismaClient();

const SAMPLE_USERS = [
  { name: "Admin User", email: "admin@datastraw.test", password: "password123", role: "Admin", team: "General" },
  { name: "Priya Sharma", email: "priya@datastraw.test", password: "password123", role: "Agent", team: "Technical" },
  { name: "Rahul Verma", email: "rahul@datastraw.test", password: "password123", role: "Agent", team: "Billing" },
  { name: "Elena Cruz", email: "elena@datastraw.test", password: "password123", role: "Agent", team: "Sales" },
];

const SAMPLE_VENDORS = [
  { name: "Acme Cloud Support", type: "Fixed", contactEmail: "support@acmecloud.example", notes: "Contracted infra vendor" },
  { name: "QuickFix IT Services", type: "Temporary", contactEmail: "hello@quickfixit.example", notes: "One-off hardware repair" },
];

const SAMPLE_TICKETS = [
  {
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    subject: "Login issue",
    description: "Cannot log in to my account after resetting my password.",
    status: "Open",
    priority: "High",
    team: "Technical",
  },
  {
    customerName: "Sam Patel",
    customerEmail: "sam@example.com",
    subject: "Billing discrepancy",
    description: "I was charged twice for my last order.",
    status: "InProgress",
    priority: "Medium",
    team: "Billing",
  },
  {
    customerName: "Alex Kim",
    customerEmail: "alex@example.com",
    subject: "Feature request",
    description: "Would like a dark mode option.",
    status: "Closed",
    priority: "Low",
    team: "General",
  },
  {
    customerName: "Morgan Lee",
    customerEmail: "morgan@example.com",
    subject: "Server outage impacting checkout",
    description: "Customers cannot complete checkout since this morning.",
    status: "Open",
    priority: "Urgent",
    team: "Technical",
    overdueHoursAgo: 2, // dueAt set 2 hours in the past, for a realistic overdue example
  },
  {
    customerName: "Taylor Brooks",
    customerEmail: "taylor@example.com",
    subject: "Waiting on hardware vendor for repair",
    description: "Escalated to QuickFix IT Services for on-site repair.",
    status: "WaitingOnVendor",
    priority: "High",
    team: "Technical",
  },
  {
    customerName: "Jordan Reyes",
    customerEmail: "jordan@example.com",
    subject: "Bulk pricing question",
    description: "Interested in a bulk license quote for 200 seats.",
    status: "Open",
    priority: "Medium",
    team: "Sales",
  },
  {
    customerName: "Casey Nguyen",
    customerEmail: "casey@example.com",
    subject: "Renewal quote follow-up",
    description: "Following up on the renewal quote sent last week.",
    status: "Triaged",
    priority: "Low",
    team: "Sales",
  },
  {
    customerName: "Jane Doe",
    customerEmail: "jane@example.com",
    subject: "Second login issue after MFA reset",
    description: "Locked out again after re-enabling two-factor authentication.",
    status: "Open",
    priority: "Medium",
    team: "Technical",
  },
];

async function main() {
  for (const name of TEAMS) {
    const existing = await prisma.team.findUnique({ where: { name } });
    if (!existing) {
      await prisma.team.create({ data: { name } });
    }
  }

  for (const [priority, hours] of Object.entries(DEFAULT_SLA_HOURS_BY_PRIORITY)) {
    const existing = await prisma.slaRule.findUnique({ where: { priority } });
    if (!existing) {
      await prisma.slaRule.create({ data: { priority, hours } });
    }
  }

  const users = [];
  for (const u of SAMPLE_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      users.push(existing);
      continue;
    }
    const passwordHash = await hashPassword(u.password);
    const created = await prisma.user.create({
      data: { name: u.name, email: u.email, passwordHash, role: u.role, team: u.team },
    });
    users.push(created);
  }

  const vendors = [];
  for (const v of SAMPLE_VENDORS) {
    let vendor = await prisma.vendor.findFirst({ where: { name: v.name } });
    if (!vendor) {
      vendor = await prisma.vendor.create({ data: v });
    }
    vendors.push(vendor);
  }

  const count = await prisma.ticket.count();
  const contactsByEmail = new Map<string, number>();
  for (let i = 0; i < SAMPLE_TICKETS.length; i++) {
    const t = SAMPLE_TICKETS[i];
    const dueAt = t.overdueHoursAgo
      ? new Date(Date.now() - t.overdueHoursAgo * 60 * 60 * 1000)
      : await computeDueAt(t.priority as any);

    const contact = await prisma.contact.upsert({
      where: { email: t.customerEmail },
      update: { name: t.customerName },
      create: { email: t.customerEmail, name: t.customerName },
    });
    contactsByEmail.set(t.customerEmail, contact.id);

    const ticket = await prisma.ticket.create({
      data: {
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        team: t.team,
        dueAt,
        ticketId: formatTicketId(count + i + 1),
        createdByUserId: users[0].id,
        contactId: contact.id,
        ...(t.subject.includes("vendor") ? { vendorId: vendors[1].id } : {}),
      },
    });

    await prisma.ticketEvent.create({
      data: { ticketId: ticket.id, actorUserId: users[0].id, type: "created", toValue: ticket.ticketId },
    });
  }

  console.log(
    `Seeded ${users.length} users, ${vendors.length} vendors, ${SAMPLE_TICKETS.length} tickets, ${contactsByEmail.size} contacts.`
  );
  console.log("Sample login: admin@datastraw.test / password123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
