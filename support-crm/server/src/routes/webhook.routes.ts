import { Router } from "express";
import { webhookController } from "../controllers/webhook.controller";
import { validateBody } from "../middleware/validate";
import { createWebhookSchema, updateWebhookSchema } from "../validators/webhook.validator";

export const webhookRouter = Router();

webhookRouter.get("/", webhookController.list);
webhookRouter.post("/", validateBody(createWebhookSchema), webhookController.create);
webhookRouter.patch("/:id", validateBody(updateWebhookSchema), webhookController.update);
webhookRouter.delete("/:id", webhookController.remove);
webhookRouter.get("/:id/deliveries", webhookController.listDeliveries);
webhookRouter.post("/:id/test", webhookController.test);
