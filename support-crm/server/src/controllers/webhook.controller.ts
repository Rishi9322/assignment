import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { webhookRepository } from "../repositories/webhook.repository";
import { ApiError } from "../middleware/errorHandler";
import { dispatchTestPing } from "../utils/webhookDispatcher";
import { WEBHOOK_EVENTS } from "../types/webhook";

const toResponse = (w: { id: number; url: string; events: string; active: boolean; createdAt: Date }) => ({
  id: w.id,
  url: w.url,
  events: JSON.parse(w.events),
  active: w.active,
  created_at: w.createdAt,
});

export const webhookController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const webhooks = await webhookRepository.listAll();
      res.json({ webhooks: webhooks.map(toResponse), available_events: WEBHOOK_EVENTS });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const secret = crypto.randomBytes(24).toString("hex");
      const webhook = await webhookRepository.create({
        url: req.body.url,
        secret,
        events: JSON.stringify(req.body.events),
      });
      // The secret is only ever returned once, on creation — it's not stored
      // in plaintext anywhere the admin UI can re-fetch it later.
      res.status(201).json({ ...toResponse(webhook), secret });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const webhook = await webhookRepository.update(Number(req.params.id), {
        url: req.body.url,
        events: req.body.events ? JSON.stringify(req.body.events) : undefined,
        active: req.body.active,
      });
      res.json(toResponse(webhook));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await webhookRepository.delete(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async listDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const deliveries = await webhookRepository.listDeliveries(Number(req.params.id));
      res.json(
        deliveries.map((d) => ({
          id: d.id,
          event_type: d.eventType,
          status_code: d.statusCode,
          success: d.success,
          error: d.error,
          created_at: d.createdAt,
        }))
      );
    } catch (err) {
      next(err);
    }
  },

  async test(req: Request, res: Response, next: NextFunction) {
    try {
      const webhook = await webhookRepository.findById(Number(req.params.id));
      if (!webhook) throw new ApiError(404, "Webhook not found");
      dispatchTestPing(webhook);
      res.status(202).json({ message: "Test delivery queued" });
    } catch (err) {
      next(err);
    }
  },
};
