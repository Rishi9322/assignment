import { Link } from "react-router-dom";
import { useAuditLog } from "../../hooks/useAuditLog";
import { Loader } from "../../components/Loader";
import { Avatar } from "../../components/Avatar";
import { formatDate } from "../../utils/date";
import type { AuditLogEntry } from "../../types/admin";

const describe = (e: AuditLogEntry): string => {
  switch (e.type) {
    case "created":
      return `created ${e.to}`;
    case "status_changed":
      return `changed status: ${e.from} → ${e.to}`;
    case "priority_changed":
      return `changed priority: ${e.from} → ${e.to}`;
    case "reopened":
      return "reopened the ticket";
    case "assigned":
      return e.to ? `assigned ${e.message}: ${e.to}` : `removed ${e.message} assignment`;
    case "note":
      return "added a note";
    case "blocked":
      return `marked as ${e.to}`;
    case "next_action_set":
      return e.to ? "set the next action" : "cleared the next action";
    case "attachment_added":
      return `attached ${e.to ?? "a file"}`;
    default:
      return e.type;
  }
};

export const AdminAuditLog = () => {
  const { data: events, isLoading } = useAuditLog();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Audit Log</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Every status change, assignment, priority change, and note across all tickets — most
        recent first.
      </p>

      <div className="mt-6">
        {isLoading && <Loader />}
        {events && events.length === 0 && (
          <div className="rounded-md border border-dashed border-line py-16 text-center text-sm text-ink-secondary">
            No activity yet.
          </div>
        )}
        {events && events.length > 0 && (
          <div className="card divide-y divide-line">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                {e.actor ? (
                  <Avatar name={e.actor.name} size="md" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-ink-muted">
                    •
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-medium">{e.actor?.name ?? "System"}</span>{" "}
                    {describe(e)}
                    {" on "}
                    <Link
                      to={`/tickets/${e.ticket.ticket_id}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {e.ticket.ticket_id}
                    </Link>{" "}
                    <span className="text-ink-secondary">{e.ticket.subject}</span>
                  </p>
                  {e.message && (e.type === "note" || e.type === "reopened") && (
                    <p className="mt-0.5 text-sm text-ink-secondary">{e.message}</p>
                  )}
                </div>
                <span className="whitespace-nowrap text-xs text-ink-muted">
                  {formatDate(e.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
