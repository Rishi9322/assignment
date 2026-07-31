import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(50),
});

export const updateTeamSchema = z
  .object({
    archived: z.boolean().optional(),
    name: z.string().trim().min(1).max(50).optional(),
  })
  .refine((data) => data.archived !== undefined || data.name !== undefined, {
    message: "At least one field must be provided",
  });
