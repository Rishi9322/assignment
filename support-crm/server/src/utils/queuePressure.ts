import { TERMINAL_STATUSES, TicketStatus } from "../types/ticket";
import { computeSlaState } from "./sla";

interface TeamTicket {
  status: string;
  priority: string;
  createdAt: Date;
  dueAt: Date | null;
  resolvedAt: Date | null;
  reopenCount: number;
  assignedToUserId: number | null;
  vendorId: number | null;
}

export interface TeamWorkload {
  team: string;
  backlog: number;
  overdue: number;
  at_risk: number;
  urgent: number;
  unassigned: number;
  aging: number;
  resolved: number;
  reopen_rate: number | null;
  pressure_score: number;
}

const AGING_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

// Deterministic backlog-pressure score (0-100), not a prediction — a weighted
// count of the signals that make a team's queue hard to keep up with: raw
// backlog size, urgent-priority load, tickets already breaching SLA, and
// tickets that have been sitting for 3+ days without resolution.
export const computeTeamWorkload = (team: string, tickets: TeamTicket[]): TeamWorkload => {
  const now = new Date();
  const backlogTickets = tickets.filter((t) => !TERMINAL_STATUSES.includes(t.status as TicketStatus));

  const overdue = backlogTickets.filter(
    (t) => computeSlaState(t.createdAt, t.dueAt, false, now).overdue
  ).length;
  const atRisk = backlogTickets.filter(
    (t) => computeSlaState(t.createdAt, t.dueAt, false, now).atRisk
  ).length;
  const urgent = backlogTickets.filter((t) => t.priority === "Urgent").length;
  const unassigned = backlogTickets.filter((t) => !t.assignedToUserId && !t.vendorId).length;
  const aging = backlogTickets.filter(
    (t) => now.getTime() - t.createdAt.getTime() > AGING_THRESHOLD_MS
  ).length;

  const resolvedTickets = tickets.filter((t) => t.resolvedAt);
  const reopened = resolvedTickets.filter((t) => t.reopenCount > 0).length;
  const reopenRate = resolvedTickets.length > 0 ? reopened / resolvedTickets.length : null;

  const pressureScore = Math.min(
    100,
    Math.round(
      backlogTickets.length * 3 +
        urgent * 10 +
        overdue * 15 +
        aging * 5 +
        (reopenRate ?? 0) * 20
    )
  );

  return {
    team,
    backlog: backlogTickets.length,
    overdue,
    at_risk: atRisk,
    urgent,
    unassigned,
    aging,
    resolved: resolvedTickets.length,
    reopen_rate: reopenRate !== null ? Math.round(reopenRate * 1000) / 1000 : null,
    pressure_score: pressureScore,
  };
};
