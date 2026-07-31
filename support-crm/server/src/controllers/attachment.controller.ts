import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import multer from "multer";
import { attachmentRepository } from "../repositories/attachment.repository";
import { ticketRepository } from "../repositories/ticket.repository";
import { prisma } from "../config/prisma";
import { ApiError } from "../middleware/errorHandler";
import {
  MAX_ATTACHMENT_SIZE,
  attachmentPath,
  deleteAttachmentFile,
  generateStoredFileName,
} from "../utils/attachmentStorage";
import { dispatchWebhookEvent } from "../utils/webhookDispatcher";

export const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ATTACHMENT_SIZE },
}).single("file");

const toResponse = (a: {
  id: number;
  originalFileName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  uploadedByUser: { id: number; name: string };
}) => ({
  id: a.id,
  file_name: a.originalFileName,
  mime_type: a.mimeType,
  size: a.size,
  uploaded_by: a.uploadedByUser,
  created_at: a.createdAt,
});

export const attachmentController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketRepository.findByTicketId(req.params.ticketId);
      if (!ticket) throw new ApiError(404, "Ticket not found");
      const file = req.file;
      if (!file) throw new ApiError(400, "No file provided");

      const storedFileName = generateStoredFileName(file.originalname);
      await fs.writeFile(attachmentPath(storedFileName), file.buffer);

      const attachment = await prisma.$transaction(async (tx) => {
        const created = await tx.attachment.create({
          data: {
            ticketId: ticket.id,
            storedFileName,
            originalFileName: file.originalname,
            mimeType: file.mimetype || "application/octet-stream",
            size: file.size,
            uploadedByUserId: req.user!.sub,
          },
          include: { uploadedByUser: { select: { id: true, name: true } } },
        });
        await tx.ticketEvent.create({
          data: {
            ticketId: ticket.id,
            actorUserId: req.user!.sub,
            type: "attachment_added",
            toValue: file.originalname,
          },
        });
        return created;
      });

      dispatchWebhookEvent("ticket.attachment_added", {
        ticket_id: ticket.ticketId,
        file_name: file.originalname,
      });
      res.status(201).json(toResponse(attachment));
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketRepository.findByTicketId(req.params.ticketId);
      if (!ticket) throw new ApiError(404, "Ticket not found");
      const attachments = await attachmentRepository.listByTicketId(ticket.id);
      res.json(attachments.map(toResponse));
    } catch (err) {
      next(err);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const attachment = await attachmentRepository.findById(Number(req.params.id));
      if (!attachment) throw new ApiError(404, "Attachment not found");
      res.download(
        attachmentPath(attachment.storedFileName),
        attachment.originalFileName,
        (err) => {
          if (err) next(err);
        }
      );
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const attachment = await attachmentRepository.findById(Number(req.params.id));
      if (!attachment) throw new ApiError(404, "Attachment not found");
      const isUploader = attachment.uploadedByUserId === req.user!.sub;
      if (!isUploader && req.user!.role !== "Admin") {
        throw new ApiError(403, "Only the uploader or an admin can delete this attachment");
      }
      await attachmentRepository.delete(attachment.id);
      deleteAttachmentFile(attachment.storedFileName);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
