import { z } from "zod";

export const updateContactSchema = z.object({
  phone: z.string().trim().min(1).nullable().optional(),
  company: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().min(1).nullable().optional(),
});
