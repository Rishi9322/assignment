import { Router } from "express";
import { attachmentController, attachmentUpload } from "../controllers/attachment.controller";

export const attachmentRouter = Router();

attachmentRouter.get("/ticket/:ticketId", attachmentController.list);
attachmentRouter.post("/ticket/:ticketId", attachmentUpload, attachmentController.upload);
attachmentRouter.get("/:id/download", attachmentController.download);
attachmentRouter.delete("/:id", attachmentController.remove);
