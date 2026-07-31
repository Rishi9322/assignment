import { NextFunction, Request, Response } from "express";
import { contactRepository } from "../repositories/contact.repository";
import { ApiError } from "../middleware/errorHandler";

export const contactController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await contactRepository.listAllWithTicketCounts();
      res.json(
        contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          notes: c.notes,
          ticket_count: c._count.tickets,
          created_at: c.createdAt,
        }))
      );
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactRepository.findById(Number(req.params.id));
      if (!contact) {
        throw new ApiError(404, "Contact not found");
      }
      res.json({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        notes: contact.notes,
        created_at: contact.createdAt,
        tickets: contact.tickets.map((t) => ({
          ticket_id: t.ticketId,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          created_at: t.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await contactRepository.update(Number(req.params.id), req.body);
      res.json({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        notes: contact.notes,
      });
    } catch (err) {
      next(err);
    }
  },
};
