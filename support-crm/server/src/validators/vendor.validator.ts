import { z } from "zod";
import { VENDOR_TYPES } from "../types/vendor";

export const createVendorSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  type: z.enum(VENDOR_TYPES),
  contact_email: z.string().trim().email().optional(),
  contact_phone: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
});
