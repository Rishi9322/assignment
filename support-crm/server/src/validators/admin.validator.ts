import { z } from "zod";
import { ROLES } from "../types/user";
import { TEAMS } from "../types/ticket";

export const updateUserSchema = z
  .object({
    role: z.enum(ROLES).optional(),
    active: z.boolean().optional(),
    team: z.enum(TEAMS).nullable().optional(),
  })
  .refine((data) => data.role !== undefined || data.active !== undefined || data.team !== undefined, {
    message: "At least one field must be provided",
  });
