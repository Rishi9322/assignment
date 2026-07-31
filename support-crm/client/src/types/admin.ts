import type { Role } from "./user";
import type { Team, TicketEventType } from "./ticket";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  team: Team | null;
  active: boolean;
  createdAt: string;
  lockedUntil: string | null;
}

export interface UpdateUserPayload {
  role?: Role;
  active?: boolean;
  team?: Team | null;
}

export interface TeamWorkload {
  team: Team;
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

export interface TeamDirectoryEntry {
  id: number;
  name: string;
  archived: boolean;
  created_at: string;
}

export interface CreateTeamPayload {
  name: string;
}

export interface UpdateTeamPayload {
  name?: string;
  archived?: boolean;
}

export interface AuditLogEntry {
  id: number;
  type: TicketEventType;
  from: string | null;
  to: string | null;
  message: string | null;
  actor: { id: number; name: string; email: string } | null;
  ticket: { ticket_id: string; subject: string };
  created_at: string;
}
