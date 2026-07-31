import { Router } from "express";
import { contactController } from "../controllers/contact.controller";
import { validateBody } from "../middleware/validate";
import { updateContactSchema } from "../validators/contact.validator";

export const contactRouter = Router();

contactRouter.get("/", contactController.list);
contactRouter.get("/:id", contactController.getById);
contactRouter.patch("/:id", validateBody(updateContactSchema), contactController.update);
