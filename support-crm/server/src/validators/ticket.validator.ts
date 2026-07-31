import { z } from "zod";
import { PRIORITIES, SAVED_VIEWS, SORT_FIELDS, SORT_ORDERS, TEAMS, TICKET_STATUSES } from "../types/ticket";

export const createTicketSchema = z.object({
  customer_name: z.string().trim().min(1, "customer_name is required"),
  customer_email: z.string().trim().email("customer_email must be a valid email"),
  subject: z.string().trim().min(1, "subject is required"),
  description: z.string().trim().min(1, "description is required"),
  priority: z.enum(PRIORITIES).optional(),
});

export const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES).optional(),
    notes: z.string().trim().min(1).optional(),
    priority: z.enum(PRIORITIES).optional(),
    team: z.enum(TEAMS).nullable().optional(),
    assigned_to_user_id: z.number().int().positive().nullable().optional(),
    vendor_id: z.number().int().positive().nullable().optional(),
    next_action: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.notes !== undefined ||
      data.priority !== undefined ||
      data.team !== undefined ||
      data.assigned_to_user_id !== undefined ||
      data.vendor_id !== undefined ||
      data.next_action !== undefined,
    { message: "At least one field must be provided" }
  )
  .refine(
    (data) => !(data.assigned_to_user_id != null && data.vendor_id != null),
    {
      message: "A ticket can be owned by either an employee or a vendor, not both at once",
      path: ["vendor_id"],
    }
  );

export const addNoteSchema = z.object({
  message: z.string().trim().min(1, "message is required"),
});

export const listTicketsQuerySchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
  team: z.enum(TEAMS).optional(),
  view: z.enum(SAVED_VIEWS).optional(),
  page: z.coerce.number().int().min(1).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.enum(SORT_FIELDS).optional(),
  order: z.enum(SORT_ORDERS).optional(),
});
