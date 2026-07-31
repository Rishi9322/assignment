import { z } from "zod";
import { PRIORITIES, TICKET_STATUSES } from "../types/ticket";

export const updateSettingsSchema = z.object({
  org_name: z.string().trim().min(1).max(80).optional(),
  support_email: z.string().trim().email().nullable().optional(),
  accent_color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "accent_color must be a hex color like #2563eb")
    .optional(),
  status_labels: z.record(z.enum(TICKET_STATUSES), z.string().trim().min(1).max(40)).optional(),
  priority_labels: z.record(z.enum(PRIORITIES), z.string().trim().min(1).max(40)).optional(),
  session_timeout_minutes: z.coerce.number().int().min(5).max(43200).optional(), // 5min–30 days
  max_login_attempts: z.coerce.number().int().min(3).max(20).optional(),
  lockout_minutes: z.coerce.number().int().min(1).max(1440).optional(),
});
