import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

export const notificationRouter = Router();

notificationRouter.get("/", notificationController.list);
notificationRouter.post("/mark-all-read", notificationController.markAllRead);
notificationRouter.patch("/:id/read", notificationController.markRead);
