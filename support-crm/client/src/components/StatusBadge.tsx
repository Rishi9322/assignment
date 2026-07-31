import { useStatusLabel } from "../hooks/useLabels";
import type { TicketStatus } from "../types/ticket";

const COLORS: Record<TicketStatus, string> = {
  Open: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  Triaged: "bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300",
  InProgress: "bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",
  WaitingOnCustomer: "bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
  WaitingOnVendor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-300",
  Resolved: "bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300",
  Closed: "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300",
};

export const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const statusLabel = useStatusLabel();
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
};
