import type { TicketEvent } from "../types/ticket";
import { STATUS_LABELS } from "../types/ticket";
import type { TicketStatus } from "../types/ticket";
import { Avatar } from "./Avatar";
import { formatDate } from "../utils/date";

const statusLabel = (value: string | null) =>
  value ? STATUS_LABELS[value as TicketStatus] ?? value : null;

const describe = (event: TicketEvent): string => {
  switch (event.type) {
    case "created":
      return `Created ticket ${event.to ?? ""}`;
    case "status_changed":
      return `Changed status: ${statusLabel(event.from)} → ${statusLabel(event.to)}`;
    case "priority_changed":
      return `Changed priority: ${event.from} → ${event.to}`;
    case "reopened":
      return "Reopened the ticket";
    case "assigned": {
      const kind = event.message ?? "assignment";
      return event.to
        ? `Assigned ${kind}: ${event.to}`
        : `Removed ${kind} assignment`;
    }
    case "note":
      return "Added a note";
    case "blocked":
      return `Marked as ${statusLabel(event.to)}`;
    case "next_action_set":
      return event.to ? "Set the next action" : "Cleared the next action";
    default:
      return event.type;
  }
};

export const TicketTimeline = ({ events }: { events: TicketEvent[] }) => {
  if (events.length === 0) {
    return <p className="text-sm text-ink-secondary">No activity yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <div className="mt-0.5">
            {event.actor ? (
              <Avatar name={event.actor.name} size="md" />
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-ink-muted">
                •
              </span>
            )}
          </div>
          <div className="flex-1 rounded-md bg-surface-alt px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm text-ink">
                <span className="font-medium">{event.actor?.name ?? "System"}</span>{" "}
                {describe(event)}
              </p>
              <span className="whitespace-nowrap text-xs text-ink-muted">
                {formatDate(event.created_at)}
              </span>
            </div>
            {event.type === "note" && event.message && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">{event.message}</p>
            )}
            {event.type === "reopened" && event.message && (
              <p className="mt-1 text-sm text-ink-secondary">Reason: {event.message}</p>
            )}
            {event.type === "blocked" && event.message && (
              <p className="mt-1 text-sm text-ink-secondary">Reason: {event.message}</p>
            )}
            {event.type === "next_action_set" && event.to && (
              <p className="mt-1 text-sm text-ink-secondary">{event.to}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};
