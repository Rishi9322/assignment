export const WEBHOOK_EVENTS = [
  "ticket.created",
  "ticket.status_changed",
  "ticket.priority_changed",
  "ticket.assigned",
  "ticket.note",
  "ticket.reopened",
  "ticket.blocked",
  "ticket.next_action_set",
  "ticket.attachment_added",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
