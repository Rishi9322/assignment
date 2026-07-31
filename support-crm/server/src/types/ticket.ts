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

export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TEAMS = ["Technical", "Billing", "Sales", "General"] as const;
export type Team = (typeof TEAMS)[number];

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

export interface CreateTicketInput {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: Priority;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  notes?: string;
  priority?: Priority;
  team?: Team | null;
  assigned_to_user_id?: number | null;
  vendor_id?: number | null;
  next_action?: string | null;
}

export const SAVED_VIEWS = ["all", "mine", "urgent", "unassigned", "blocked"] as const;
export type SavedView = (typeof SAVED_VIEWS)[number];

export const SORT_FIELDS = ["created_at", "updated_at", "due_at", "priority"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface TicketListQuery {
  status?: TicketStatus;
  search?: string;
  team?: Team;
  view?: SavedView;
  page?: number;
  page_size?: number;
  sort?: SortField;
  order?: SortOrder;
}
