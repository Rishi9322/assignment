import { Router } from "express";
import { permissionController } from "../controllers/permission.controller";
import { requireAdmin } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { updateRolePermissionsSchema } from "../validators/permission.validator";

export const permissionRouter = Router();

// Mounted with requireAuth only — "mine" is for any authenticated user to
// discover their own effective permissions; the matrix itself stays Admin-only.
permissionRouter.get("/mine", permissionController.mine);
permissionRouter.get("/", requireAdmin, permissionController.matrix);
permissionRouter.put(
  "/:role",
  requireAdmin,
  validateBody(updateRolePermissionsSchema),
  permissionController.updateRole
);
