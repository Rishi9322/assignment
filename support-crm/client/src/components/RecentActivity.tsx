import { Link } from "react-router-dom";
import type { TicketSummary } from "../types/ticket";
import { StatusBadge } from "./StatusBadge";
import { Avatar } from "./Avatar";
import { formatDate } from "../utils/date";

interface Props {
  tickets: TicketSummary[];
}

export const RecentActivity = ({ tickets }: Props) => {
  const recent = [...tickets]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <div className="card p-4">
      <h2 className="text-sm font-semibold text-ink">Recent activity</h2>

      {recent.length === 0 && (
        <p className="mt-3 text-sm text-ink-muted">Nothing yet — activity will show up here.</p>
      )}

      <ul className="mt-3 space-y-3">
        {recent.map((t) => (
          <li key={t.ticket_id}>
            <Link
              to={`/tickets/${t.ticket_id}`}
              className="flex items-start justify-between gap-2 rounded-md px-1 py-1 hover:bg-surface-alt"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-ink">{t.subject}</p>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-secondary">
                  <span className="font-medium text-accent">{t.ticket_id}</span>
                  <span>·</span>
                  <span>{formatDate(t.updated_at)}</span>
                  {t.assigned_to && (
                    <>
                      <span>·</span>
                      <Avatar name={t.assigned_to.name} />
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={t.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
