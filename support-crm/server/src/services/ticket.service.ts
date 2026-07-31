import { ticketRepository, TicketFieldUpdate } from "../repositories/ticket.repository";
import { ticketEventRepository } from "../repositories/ticketEvent.repository";
import { userRepository } from "../repositories/user.repository";
import { vendorRepository } from "../repositories/vendor.repository";
import { ApiError } from "../middleware/errorHandler";
import {
  BLOCKED_STATUSES,
  CreateTicketInput,
  TERMINAL_STATUSES,
  TicketEventType,
  TicketListQuery,
  UpdateTicketInput,
} from "../types/ticket";
import { computeDueAt } from "../utils/sla";
import { dispatchWebhookEvent } from "../utils/webhookDispatcher";
import { notify } from "../utils/notify";

interface QueuedEvent {
  type: TicketEventType;
  fromValue?: string | null;
  toValue?: string | null;
  message?: string | null;
}

export const ticketService = {
  async createTicket(input: CreateTicketInput, createdByUserId: number) {
    const ticket = await ticketRepository.create({ ...input, createdByUserId });
    dispatchWebhookEvent("ticket.created", {
      ticket_id: ticket.ticketId,
      subject: ticket.subject,
      customer_email: ticket.customerEmail,
      priority: ticket.priority,
      status: ticket.status,
    });
    return ticket;
  },

  listTickets(query: TicketListQuery, viewerId: number) {
    return ticketRepository.findMany(query, viewerId);
  },

  async getTicket(ticketId: string) {
    const ticket = await ticketRepository.findByTicketId(ticketId);
    if (!ticket) {
      throw new ApiError(404, `Ticket ${ticketId} not found`);
    }
    const events = await ticketEventRepository.findByTicketId(ticket.id);
    return { ...ticket, events };
  },

  async updateTicket(ticketId: string, input: UpdateTicketInput, actorUserId: number) {
    const existing = await ticketRepository.findByTicketId(ticketId);
    if (!existing) {
      throw new ApiError(404, `Ticket ${ticketId} not found`);
    }

    // Single-ownership rule: an internal employee and a vendor can't both own a
    // ticket at once. If the caller explicitly sets one and leaves the other
    // unspecified, the previously-set owner is cleared rather than left stale.
    let nextAssignedTo = input.assigned_to_user_id;
    let nextVendorId = input.vendor_id;
    if (nextAssignedTo !== undefined && nextAssignedTo !== null) {
      if (nextVendorId === undefined && existing.vendorId !== null) nextVendorId = null;
    }
    if (nextVendorId !== undefined && nextVendorId !== null) {
      if (nextAssignedTo === undefined && existing.assignedToUserId !== null) nextAssignedTo = null;
    }

    const update: TicketFieldUpdate = {};
    const events: QueuedEvent[] = [];
    // input.notes is consumed as the reason for whichever specific event
    // triggered it (reopen, entering a blocked state) rather than ALSO being
    // logged again as a plain "note" event underneath — otherwise the same
    // reason shows up twice in the timeline.
    let notesConsumedBy: string | null = null;

    if (input.status !== undefined && input.status !== existing.status) {
      update.status = input.status;
      events.push({ type: "status_changed", fromValue: existing.status, toValue: input.status });
      notify(
        existing.assignedToUserId,
        actorUserId,
        "status_changed",
        `${existing.ticketId} status changed to ${input.status}`,
        existing.id
      );

      const wasTerminal = TERMINAL_STATUSES.includes(existing.status as any);
      const isTerminal = TERMINAL_STATUSES.includes(input.status as any);
      const enteringBlocked =
        BLOCKED_STATUSES.includes(input.status as any) &&
        !BLOCKED_STATUSES.includes(existing.status as any);

      if (isTerminal && !existing.resolvedAt) {
        update.resolvedAt = new Date();
      } else if (!isTerminal && wasTerminal) {
        update.resolvedAt = null;
        update.reopenCount = existing.reopenCount + 1;
        events.push({ type: "reopened", message: input.notes ?? null });
        if (input.notes) notesConsumedBy = "reopened";
      } else if (enteringBlocked && input.notes) {
        events.push({ type: "blocked", toValue: input.status, message: input.notes });
        notesConsumedBy = "blocked";
      }
    }

    if (input.priority !== undefined && input.priority !== existing.priority) {
      update.priority = input.priority;
      events.push({ type: "priority_changed", fromValue: existing.priority, toValue: input.priority });
      if (!existing.resolvedAt) {
        update.dueAt = await computeDueAt(input.priority);
      }
    }

    if (input.team !== undefined && input.team !== existing.team) {
      update.team = input.team;
      events.push({ type: "assigned", fromValue: existing.team, toValue: input.team, message: "team" });
    }

    if (nextAssignedTo !== undefined && nextAssignedTo !== existing.assignedToUserId) {
      update.assignedToUserId = nextAssignedTo;
      const newUser = nextAssignedTo ? await userRepository.findById(nextAssignedTo) : null;
      events.push({
        type: "assigned",
        fromValue: null,
        toValue: newUser ? newUser.name : null,
        message: "employee",
      });
      notify(
        nextAssignedTo,
        actorUserId,
        "assigned",
        `You were assigned to ${existing.ticketId}: ${existing.subject}`,
        existing.id
      );
    }

    if (nextVendorId !== undefined && nextVendorId !== existing.vendorId) {
      update.vendorId = nextVendorId;
      const newVendor = nextVendorId ? await vendorRepository.findById(nextVendorId) : null;
      events.push({
        type: "assigned",
        fromValue: null,
        toValue: newVendor ? newVendor.name : null,
        message: "vendor",
      });
    }

    if (input.next_action !== undefined && input.next_action !== existing.nextAction) {
      update.nextAction = input.next_action;
      events.push({
        type: "next_action_set",
        fromValue: existing.nextAction,
        toValue: input.next_action,
      });
    }

    if (input.notes && !notesConsumedBy) {
      events.push({ type: "note", message: input.notes });
    }

    if (events.length > 0 && !existing.firstRespondedAt) {
      update.firstRespondedAt = new Date();
    }

    if (Object.keys(update).length > 0) {
      await ticketRepository.updateById(existing.id, update);
    }

    for (const event of events) {
      await ticketEventRepository.create({ ticketId: existing.id, actorUserId, ...event });
      dispatchWebhookEvent(`ticket.${event.type}`, {
        ticket_id: existing.ticketId,
        from: event.fromValue ?? null,
        to: event.toValue ?? null,
        message: event.message ?? null,
      });
    }

    return this.getTicket(ticketId);
  },

  async addNote(ticketId: string, message: string, actorUserId: number) {
    const existing = await ticketRepository.findByTicketId(ticketId);
    if (!existing) {
      throw new ApiError(404, `Ticket ${ticketId} not found`);
    }
    if (!existing.firstRespondedAt) {
      await ticketRepository.updateById(existing.id, { firstRespondedAt: new Date() });
    }
    await ticketEventRepository.create({
      ticketId: existing.id,
      actorUserId,
      type: "note",
      message,
    });
    dispatchWebhookEvent("ticket.note", { ticket_id: existing.ticketId, message });
    notify(
      existing.assignedToUserId,
      actorUserId,
      "note",
      `New note on ${existing.ticketId}: ${existing.subject}`,
      existing.id
    );
    return this.getTicket(ticketId);
  },
};
