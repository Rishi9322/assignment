import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateSettingsSchema } from "../validators/settings.validator";

export const settingsRouter = Router();

// GET is public (unauthenticated) — branding needs to render on Login/Register
// before a session exists, and none of this data is sensitive.
settingsRouter.get("/", settingsController.get);
settingsRouter.get("/admin", requireAuth, requireAdmin, settingsController.getAdmin);
settingsRouter.patch(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(updateSettingsSchema),
  settingsController.update
);
