import { Link } from "react-router-dom";
import { useRecentActivity } from "../hooks/useRecentActivity";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "./Avatar";
import { Loader } from "./Loader";
import { formatDate } from "../utils/date";
import { STATUS_LABELS } from "../types/ticket";
import type { RecentActivityEntry, TicketStatus } from "../types/ticket";

const statusLabel = (value: string | null) =>
  value ? STATUS_LABELS[value as TicketStatus] ?? value : null;

const describe = (e: RecentActivityEntry): string => {
  switch (e.type) {
    case "created":
      return "created this ticket";
    case "status_changed":
      return `changed status: ${statusLabel(e.from)} → ${statusLabel(e.to)}`;
    case "priority_changed":
      return `changed priority: ${e.from} → ${e.to}`;
    case "reopened":
      return "reopened this ticket";
    case "assigned":
      return e.to ? `assigned ${e.message}: ${e.to}` : `removed ${e.message} assignment`;
    case "note":
      return "added a note";
    case "blocked":
      return `marked as ${statusLabel(e.to)}`;
    case "next_action_set":
      return e.to ? "set the next action" : "cleared the next action";
    case "attachment_added":
      return `attached ${e.to ?? "a file"}`;
    default:
      return e.type;
  }
};

// A real, org-wide activity feed sourced from the ticket event log — not the
// currently filtered/paginated ticket list, so it stays accurate regardless
// of whatever search/filter/page the dashboard is showing.
export const RecentActivity = () => {
  const { data: events, isLoading } = useRecentActivity();

  return (
    <div className="card p-4">
      <h2 className="text-sm font-semibold text-ink">Recent activity</h2>

      {isLoading && <Loader />}

      {events && events.length === 0 && (
        <p className="mt-3 text-sm text-ink-muted">Nothing yet — activity will show up here.</p>
      )}

      <ul className="mt-3 space-y-3">
        {events?.map((e) => (
          <li key={e.id}>
            <Link
              to={`/tickets/${e.ticket.ticket_id}`}
              className="flex items-start justify-between gap-2 rounded-md px-1 py-1 hover:bg-surface-alt"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">
                  <span className="font-medium">{e.actor?.name ?? "System"}</span>{" "}
                  <span className="text-ink-secondary">{describe(e)}</span>
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-secondary">
                  <span className="font-medium text-accent">{e.ticket.ticket_id}</span>
                  <span>·</span>
                  <span className="truncate">{e.ticket.subject}</span>
                  <span>·</span>
                  <span className="whitespace-nowrap">{formatDate(e.created_at)}</span>
                  {e.actor && (
                    <>
                      <span>·</span>
                      <Avatar name={e.actor.name} />
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={e.ticket.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
