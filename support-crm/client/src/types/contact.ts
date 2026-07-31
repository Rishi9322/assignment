import type { Priority, TicketStatus } from "./ticket";

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  ticket_count?: number;
  created_at: string;
}

export interface ContactTicketSummary {
  ticket_id: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  created_at: string;
}

export interface ContactDetail extends Contact {
  tickets: ContactTicketSummary[];
}

export interface UpdateContactPayload {
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
}
