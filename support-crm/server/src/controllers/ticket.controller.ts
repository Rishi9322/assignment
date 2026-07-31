import { NextFunction, Request, Response } from "express";
import { ticketService } from "../services/ticket.service";
import { TERMINAL_STATUSES } from "../types/ticket";
import { computeSlaState } from "../utils/sla";

const serializeUser = (u: { id: number; name: string; email: string } | null | undefined) =>
  u ? { id: u.id, name: u.name, email: u.email } : null;

const serializeVendor = (
  v:
    | { id: number; name: string; type: string; contactEmail: string | null; contactPhone: string | null }
    | null
    | undefined
) =>
  v ? { id: v.id, name: v.name, type: v.type, contact_email: v.contactEmail, contact_phone: v.contactPhone } : null;

const serializeEvent = (e: {
  id: number;
  type: string;
  fromValue: string | null;
  toValue: string | null;
  message: string | null;
  createdAt: Date;
  actor: { id: number; name: string; email: string } | null;
}) => ({
  id: e.id,
  type: e.type,
  from: e.fromValue,
  to: e.toValue,
  message: e.message,
  actor: serializeUser(e.actor),
  created_at: e.createdAt,
});

const slaState = (createdAt: Date, dueAt: Date | null, status: string) =>
  computeSlaState(createdAt, dueAt, TERMINAL_STATUSES.includes(status as any));

export const ticketController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.createTicket(req.body, req.user!.sub);
      res.status(201).json({ ticket_id: ticket.ticketId, created_at: ticket.createdAt });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await ticketService.listTickets(req.query as any);
      res.json(
        tickets.map((t) => {
          const sla = slaState(t.createdAt, t.dueAt, t.status);
          return {
            ticket_id: t.ticketId,
            customer_name: t.customerName,
            subject: t.subject,
            status: t.status,
            priority: t.priority,
            team: t.team,
            assigned_to: serializeUser(t.assignedToUser),
            vendor: serializeVendor(t.vendor),
            due_at: t.dueAt,
            overdue: sla.overdue,
            at_risk: sla.atRisk,
            next_action: t.nextAction,
            created_at: t.createdAt,
            updated_at: t.updatedAt,
          };
        })
      );
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.getTicket(req.params.ticketId);
      const sla = slaState(ticket.createdAt, ticket.dueAt, ticket.status);
      res.json({
        ticket_id: ticket.ticketId,
        customer_name: ticket.customerName,
        customer_email: ticket.customerEmail,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        created_by: serializeUser(ticket.createdByUser),
        team: ticket.team,
        assigned_to: serializeUser(ticket.assignedToUser),
        vendor: serializeVendor(ticket.vendor),
        due_at: ticket.dueAt,
        overdue: sla.overdue,
        at_risk: sla.atRisk,
        next_action: ticket.nextAction,
        first_responded_at: ticket.firstRespondedAt,
        resolved_at: ticket.resolvedAt,
        reopen_count: ticket.reopenCount,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
        events: ticket.events.map(serializeEvent),
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.updateTicket(req.params.ticketId, req.body, req.user!.sub);
      res.json({ success: true, updated_at: ticket?.updatedAt });
    } catch (err) {
      next(err);
    }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.addNote(req.params.ticketId, req.body.message, req.user!.sub);
      res.status(201).json({ events: ticket.events.map(serializeEvent) });
    } catch (err) {
      next(err);
    }
  },
};
