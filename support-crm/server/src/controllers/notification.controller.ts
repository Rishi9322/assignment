import { NextFunction, Request, Response } from "express";
import { notificationRepository } from "../repositories/notification.repository";

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationRepository.listForUser(req.user!.sub),
        notificationRepository.countUnread(req.user!.sub),
      ]);
      res.json({
        unread_count: unreadCount,
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          message: n.message,
          ticket_id: n.ticket?.ticketId ?? null,
          read: n.read,
          created_at: n.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markRead(Number(req.params.id), req.user!.sub);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationRepository.markAllRead(req.user!.sub);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
