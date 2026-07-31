import { Priority } from "../types/ticket";
import { slaRuleRepository } from "../repositories/slaRule.repository";

// Fallback used only if a priority has no admin-configured SlaRule row yet
// (e.g. a fresh, unseeded database) — the seed script populates real rows.
export const DEFAULT_SLA_HOURS_BY_PRIORITY: Record<Priority, number> = {
  Urgent: 4,
  High: 24,
  Medium: 72,
  Low: 168,
};

export const computeDueAt = async (priority: Priority, from: Date = new Date()): Promise<Date> => {
  const rules = await slaRuleRepository.listAll();
  const hours = rules.find((r) => r.priority === priority)?.hours ?? DEFAULT_SLA_HOURS_BY_PRIORITY[priority];
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
};

// A ticket enters SLA risk once less than this fraction of its total resolution
// window remains — an early warning before it actually breaches.
const AT_RISK_REMAINING_FRACTION = 0.25;

export const computeSlaState = (
  createdAt: Date,
  dueAt: Date | null,
  isTerminal: boolean,
  now: Date = new Date()
): { overdue: boolean; atRisk: boolean } => {
  if (!dueAt || isTerminal) return { overdue: false, atRisk: false };

  if (dueAt.getTime() < now.getTime()) {
    return { overdue: true, atRisk: false };
  }

  const totalWindowMs = dueAt.getTime() - createdAt.getTime();
  const remainingMs = dueAt.getTime() - now.getTime();
  const remainingFraction = totalWindowMs > 0 ? remainingMs / totalWindowMs : 0;

  return { overdue: false, atRisk: remainingFraction <= AT_RISK_REMAINING_FRACTION };
};
