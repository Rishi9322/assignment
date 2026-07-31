import { Router } from "express";
import { prisma } from "../config/prisma";
import { ticketEventRepository } from "../repositories/ticketEvent.repository";
import { BLOCKED_STATUSES, TERMINAL_STATUSES, TicketStatus } from "../types/ticket";
import { computeSlaState } from "../utils/sla";

export const statsRouter = Router();

const ACTIVE_NON_OPEN_STATUSES: TicketStatus[] = [
  "Triaged",
  "InProgress",
  "WaitingOnCustomer",
  "WaitingOnVendor",
];

statsRouter.get("/", async (_req, res, next) => {
  try {
    const todayStartUTC = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
    );

    const [
      total,
      open,
      active,
      closed,
      unassigned,
      overdue,
      waitingOnVendor,
      resolvedToday,
      blocked,
      blockedMissingNextAction,
      activeWithDueDates,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "Open" } }),
      prisma.ticket.count({ where: { status: { in: ACTIVE_NON_OPEN_STATUSES } } }),
      prisma.ticket.count({ where: { status: { in: [...TERMINAL_STATUSES] } } }),
      prisma.ticket.count({
        where: {
          assignedToUserId: null,
          vendorId: null,
          status: { notIn: [...TERMINAL_STATUSES] },
        },
      }),
      prisma.ticket.count({
        where: { status: { notIn: [...TERMINAL_STATUSES] }, dueAt: { lt: new Date() } },
      }),
      prisma.ticket.count({ where: { status: "WaitingOnVendor" } }),
      prisma.ticket.count({ where: { resolvedAt: { gte: todayStartUTC } } }),
      prisma.ticket.count({ where: { status: { in: [...BLOCKED_STATUSES] } } }),
      // The handoff-gap signal: blocked with no defined next action means
      // whoever picks this ticket up next has no idea what to do with it.
      prisma.ticket.count({
        where: { status: { in: [...BLOCKED_STATUSES] }, nextAction: null },
      }),
      // At-risk depends on how much of each ticket's own SLA window remains, which
      // isn't expressible as a single WHERE clause — fetch the small active set and
      // compute in JS (fine at this scale; revisit with a materialized column if the
      // active ticket count ever gets large).
      prisma.ticket.findMany({
        where: { status: { notIn: [...TERMINAL_STATUSES] }, dueAt: { not: null } },
        select: { createdAt: true, dueAt: true },
      }),
    ]);

    const atRisk = activeWithDueDates.filter(
      (t) => computeSlaState(t.createdAt, t.dueAt, false).atRisk
    ).length;

    res.json({
      total,
      open,
      // Everything past intake but not yet terminal — Triaged, InProgress, and
      // both waiting states. Deliberately not called "in_progress": it would
      // undercount by hiding the waiting-state tickets bucketed in here too.
      active,
      closed,
      unassigned,
      overdue,
      at_risk: atRisk,
      waiting_on_vendor: waitingOnVendor,
      resolved_today: resolvedToday,
      blocked,
      blocked_missing_next_action: blockedMissingNextAction,
    });
  } catch (err) {
    next(err);
  }
});

statsRouter.get("/recent-activity", async (_req, res, next) => {
  try {
    const events = await ticketEventRepository.findRecent(8);
    res.json(
      events.map((e) => ({
        id: e.id,
        type: e.type,
        from: e.fromValue,
        to: e.toValue,
        message: e.message,
        actor: e.actor ? { id: e.actor.id, name: e.actor.name, email: e.actor.email } : null,
        ticket: { ticket_id: e.ticket.ticketId, subject: e.ticket.subject, status: e.ticket.status },
        created_at: e.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

const DAYS = 14;

statsRouter.get("/trend", async (_req, res, next) => {
  try {
    // All date math stays in UTC: bucket keys are read back via toISOString(),
    // so building `since` with local-time getDate/setDate/setHours would let a
    // non-UTC server timezone shift local midnight across the UTC day boundary
    // and silently drop "today" out of the window.
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const since = new Date(todayUTC - (DAYS - 1) * 24 * 60 * 60 * 1000);

    const tickets = await prisma.ticket.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const t of tickets) {
      const key = t.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    res.json(Array.from(buckets.entries()).map(([date, count]) => ({ date, count })));
  } catch (err) {
    next(err);
  }
});
