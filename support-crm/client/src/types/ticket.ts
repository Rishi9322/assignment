import type { User } from "./user";
import type { Vendor } from "./vendor";

export const TICKET_STATUSES = [
  "Open",
  "Triaged",
  "InProgress",
  "WaitingOnCustomer",
  "WaitingOnVendor",
  "Resolved",
  "Closed",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TERMINAL_STATUSES: readonly TicketStatus[] = ["Resolved", "Closed"];
export const BLOCKED_STATUSES: readonly TicketStatus[] = ["WaitingOnCustomer", "WaitingOnVendor"];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  Open: "Open",
  Triaged: "Triaged",
  InProgress: "In Progress",
  WaitingOnCustomer: "Waiting on Customer",
  WaitingOnVendor: "Waiting on Vendor",
  Resolved: "Resolved",
  Closed: "Closed",
};

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

// Team names are DB-driven (admin-managed via /api/admin/team-directory),
// not a fixed compile-time set — fetch the active list with useTeams().
export type Team = string;

export const SAVED_VIEWS = ["all", "mine", "urgent", "unassigned", "blocked"] as const;
export type SavedView = (typeof SAVED_VIEWS)[number];
export const SAVED_VIEW_LABELS: Record<SavedView, string> = {
  all: "All",
  mine: "Mine",
  urgent: "Urgent",
  unassigned: "Unassigned",
  blocked: "Blocked",
};

export const SORT_FIELDS = ["created_at", "updated_at", "due_at", "priority"] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export const SORT_FIELD_LABELS: Record<SortField, string> = {
  created_at: "Created",
  updated_at: "Updated",
  due_at: "Due",
  priority: "Priority",
};

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const EVENT_TYPES = [
  "created",
  "status_changed",
  "priority_changed",
  "assigned",
  "note",
  "reopened",
  "blocked",
  "next_action_set",
  "attachment_added",
] as const;
export type TicketEventType = (typeof EVENT_TYPES)[number];

export interface RecentActivityEntry {
  id: number;
  type: TicketEventType;
  from: string | null;
  to: string | null;
  message: string | null;
  actor: Pick<User, "id" | "name" | "email"> | null;
  ticket: { ticket_id: string; subject: string; status: TicketStatus };
  created_at: string;
}

export interface TicketEvent {
  id: number;
  type: TicketEventType;
  from: string | null;
  to: string | null;
  message: string | null;
  actor: Pick<User, "id" | "name" | "email"> | null;
  created_at: string;
}

export interface Attachment {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  uploaded_by: Pick<User, "id" | "name">;
  created_at: string;
}

export interface TicketSummary {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  team: Team | null;
  assigned_to: Pick<User, "id" | "name" | "email"> | null;
  vendor: Vendor | null;
  due_at: string | null;
  overdue: boolean;
  at_risk: boolean;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketDetail {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  created_by: Pick<User, "id" | "name" | "email">;
  contact_id: number | null;
  team: Team | null;
  assigned_to: Pick<User, "id" | "name" | "email"> | null;
  vendor: Vendor | null;
  due_at: string | null;
  overdue: boolean;
  at_risk: boolean;
  next_action: string | null;
  first_responded_at: string | null;
  resolved_at: string | null;
  reopen_count: number;
  created_at: string;
  updated_at: string;
  events: TicketEvent[];
}

export interface CreateTicketPayload {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: Priority;
}

export interface Stats {
  total: number;
  open: number;
  active: number;
  closed: number;
  unassigned: number;
  overdue: number;
  at_risk: number;
  waiting_on_vendor: number;
  resolved_today: number;
  blocked: number;
  blocked_missing_next_action: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface PaginatedTickets {
  data: TicketSummary[];
  total: number;
  page: number;
  page_size: number;
}
