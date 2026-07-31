import { z } from "zod";
import { ROLES } from "../types/user";

export const updateUserSchema = z
  .object({
    role: z.enum(ROLES).optional(),
    active: z.boolean().optional(),
    team: z.string().trim().min(1).max(50).nullable().optional(),
  })
  .refine((data) => data.role !== undefined || data.active !== undefined || data.team !== undefined, {
    message: "At least one field must be provided",
  });
