import { Link } from "react-router-dom";
import type { TicketSummary } from "../types/ticket";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";
import { Pagination } from "./Pagination";
import { formatAge, formatDate } from "../utils/date";

interface Props {
  tickets: TicketSummary[];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export const TicketTable = ({ tickets, page, pageSize, total, onPageChange }: Props) => {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-dashed border-line py-16 text-center">
        <svg
          className="h-10 w-10 text-ink-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-3 text-sm text-ink-secondary">No tickets found.</p>
        <Link to="/tickets/new" className="btn-primary mt-3">
          Create a ticket
        </Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-surface-alt">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">ID</th>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">Name</th>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">Title</th>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">Priority</th>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">Status</th>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">Assigned</th>
            <th className="px-4 py-2 text-left font-medium text-ink-secondary">Age</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tickets.map((ticket) => (
            <tr
              key={ticket.ticket_id}
              className={`hover:bg-surface-alt ${
                ticket.overdue
                  ? "border-l-2 border-l-danger"
                  : ticket.at_risk
                    ? "border-l-2 border-l-warning"
                    : ""
              }`}
            >
              <td className="px-4 py-3">
                <Link
                  to={`/tickets/${ticket.ticket_id}`}
                  className="font-medium text-accent hover:underline"
                >
                  {ticket.ticket_id}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink">{ticket.customer_name}</td>
              <td className="px-4 py-3 text-ink">{ticket.subject}</td>
              <td className="px-4 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 text-ink-secondary">
                <div className="flex items-center gap-1.5">
                  {ticket.assigned_to && <Avatar name={ticket.assigned_to.name} />}
                  <span>
                    {[ticket.team, ticket.assigned_to?.name, ticket.vendor?.name]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                </div>
              </td>
              <td
                className={`px-4 py-3 ${
                  ticket.overdue
                    ? "font-medium text-danger"
                    : ticket.at_risk
                      ? "font-medium text-warning"
                      : "text-ink-secondary"
                }`}
                title={formatDate(ticket.created_at)}
              >
                {formatAge(ticket.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {page !== undefined && pageSize !== undefined && total !== undefined && onPageChange && (
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      )}
    </div>
  );
};
