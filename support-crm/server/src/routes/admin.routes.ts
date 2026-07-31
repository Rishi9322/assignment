import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/auth";
import { requirePermission } from "../middleware/requirePermission";
import { validateBody } from "../middleware/validate";
import { updateUserSchema } from "../validators/admin.validator";
import { createTeamSchema, updateTeamSchema } from "../validators/teamDirectory.validator";

export const adminRouter = Router();

// User management and the raw audit log stay Admin-only, non-delegable.
adminRouter.get("/users", requireAdmin, adminController.listUsers);
adminRouter.patch("/users/:id", requireAdmin, validateBody(updateUserSchema), adminController.updateUser);
adminRouter.post("/users/:id/unlock", requireAdmin, adminController.unlockUser);
adminRouter.get("/audit-log", requirePermission("view_audit_log"), adminController.auditLog);
adminRouter.get("/teams", requireAdmin, adminController.teamWorkload);

adminRouter.get(
  "/team-directory",
  requirePermission("manage_teams"),
  adminController.listTeamDirectory
);
adminRouter.post(
  "/team-directory",
  requirePermission("manage_teams"),
  validateBody(createTeamSchema),
  adminController.createTeam
);
adminRouter.patch(
  "/team-directory/:id",
  requirePermission("manage_teams"),
  validateBody(updateTeamSchema),
  adminController.updateTeam
);
