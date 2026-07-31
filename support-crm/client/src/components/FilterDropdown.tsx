import { STATUS_LABELS, TICKET_STATUSES } from "../types/ticket";
import type { TicketStatus } from "../types/ticket";

interface Props {
  value: TicketStatus | "";
  onChange: (value: TicketStatus | "") => void;
}

export const FilterDropdown = ({ value, onChange }: Props) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as TicketStatus | "")}
    className="field w-auto"
  >
    <option value="">All statuses</option>
    {TICKET_STATUSES.map((status) => (
      <option key={status} value={status}>
        {STATUS_LABELS[status]}
      </option>
    ))}
  </select>
);
