import { Router } from "express";
import { slaRuleController } from "../controllers/slaRule.controller";
import { validateBody } from "../middleware/validate";
import { updateSlaRuleSchema } from "../validators/slaRule.validator";

export const slaRuleRouter = Router();

slaRuleRouter.get("/", slaRuleController.list);
slaRuleRouter.patch("/:priority", validateBody(updateSlaRuleSchema), slaRuleController.update);
