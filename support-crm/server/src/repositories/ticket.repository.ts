import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { BLOCKED_STATUSES, CreateTicketInput, TERMINAL_STATUSES, TicketListQuery } from "../types/ticket";
import { formatTicketId } from "../utils/ticketId";
import { computeDueAt } from "../utils/sla";

const userSelect = { id: true, name: true, email: true } as const;

const PRIORITY_RANK: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export interface TicketFieldUpdate {
  status?: string;
  priority?: string;
  team?: string | null;
  assignedToUserId?: number | null;
  vendorId?: number | null;
  dueAt?: Date;
  firstRespondedAt?: Date;
  resolvedAt?: Date | null;
  reopenCount?: number;
  nextAction?: string | null;
}

export const ticketRepository = {
  // ticketId is derived from the row's own autoincrement id inside a transaction,
  // so concurrent creates can never race to the same TKT-### value (unlike deriving
  // it from a separately-read count()).
  create: (data: CreateTicketInput & { createdByUserId: number }) =>
    prisma.$transaction(
      async (tx) => {
        const priority = data.priority ?? "Medium";
        const created = await tx.ticket.create({
          data: {
            ticketId: `pending-${randomUUID()}`,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            subject: data.subject,
            description: data.description,
            priority,
            dueAt: computeDueAt(priority),
            createdByUserId: data.createdByUserId,
          },
        });
        const ticket = await tx.ticket.update({
          where: { id: created.id },
          data: { ticketId: formatTicketId(created.id) },
        });
        await tx.ticketEvent.create({
          data: {
            ticketId: ticket.id,
            actorUserId: data.createdByUserId,
            type: "created",
            toValue: ticket.ticketId,
          },
        });
        return ticket;
      },
      // SQLite serializes writers; a burst of concurrent creates queues up
      // behind the single writer lock even in WAL mode, so give queued
      // transactions more room than Prisma's 5s default before giving up.
      { timeout: 15000, maxWait: 15000 }
    ),

  findMany: async (query: TicketListQuery, viewerId: number) => {
    const where: Prisma.TicketWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.team) {
      where.team = query.team;
    }

    if (query.search) {
      const search = query.search;
      where.OR = [
        { ticketId: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { subject: { contains: search } },
        { description: { contains: search } },
      ];
    }

    switch (query.view) {
      case "mine":
        where.assignedToUserId = viewerId;
        break;
      case "urgent":
        where.priority = "Urgent";
        where.status = { notIn: [...TERMINAL_STATUSES] };
        break;
      case "unassigned":
        where.assignedToUserId = null;
        where.vendorId = null;
        where.status = { notIn: [...TERMINAL_STATUSES] };
        break;
      case "blocked":
        where.status = { in: [...BLOCKED_STATUSES] };
        break;
    }

    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 25;
    const sort = query.sort ?? "created_at";
    const order = query.order ?? "desc";

    const include = { assignedToUser: { select: userSelect }, vendor: true };

    // Priority has no natural DB sort order (it's just text) — sorting by rank
    // needs the full matching set in memory. Every other field sorts and pages
    // at the DB level, which is what matters once ticket volume grows.
    if (sort === "priority") {
      const all = await prisma.ticket.findMany({ where, include });
      const sorted = all.sort((a, b) => {
        const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        return order === "asc" ? diff : -diff;
      });
      const total = sorted.length;
      const tickets = sorted.slice((page - 1) * pageSize, page * pageSize);
      return { tickets, total };
    }

    const sortFieldMap: Record<string, string> = {
      created_at: "createdAt",
      updated_at: "updatedAt",
      due_at: "dueAt",
    };
    const orderBy = { [sortFieldMap[sort]]: order };

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, total };
  },

  findById: (id: number) => prisma.ticket.findUnique({ where: { id } }),

  findByTicketId: (ticketId: string) =>
    prisma.ticket.findUnique({
      where: { ticketId },
      include: {
        createdByUser: { select: userSelect },
        assignedToUser: { select: userSelect },
        vendor: true,
      },
    }),

  updateById: (id: number, data: TicketFieldUpdate) =>
    prisma.ticket.update({ where: { id }, data }),
};
