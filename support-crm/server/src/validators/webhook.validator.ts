import { z } from "zod";

export const createWebhookSchema = z.object({
  url: z.string().trim().url("url must be a valid URL"),
  events: z.array(z.string().trim().min(1)).min(1, "At least one event must be selected"),
});

export const updateWebhookSchema = z
  .object({
    url: z.string().trim().url().optional(),
    events: z.array(z.string().trim().min(1)).min(1).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.url !== undefined || data.events !== undefined || data.active !== undefined, {
    message: "At least one field must be provided",
  });
