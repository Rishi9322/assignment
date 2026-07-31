import { z } from "zod";

export const updateSlaRuleSchema = z.object({
  hours: z.coerce.number().int().min(1, "hours must be at least 1").max(8760, "hours must be at most a year"),
});
