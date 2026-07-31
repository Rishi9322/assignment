import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { validateBody } from "../middleware/validate";
import { updateUserSchema } from "../validators/admin.validator";

export const adminRouter = Router();

adminRouter.get("/users", adminController.listUsers);
adminRouter.patch("/users/:id", validateBody(updateUserSchema), adminController.updateUser);
adminRouter.get("/audit-log", adminController.auditLog);
adminRouter.get("/teams", adminController.teamWorkload);
