import { useStatusLabel } from "../hooks/useLabels";
import { TICKET_STATUSES } from "../types/ticket";
import type { TicketStatus } from "../types/ticket";

interface Props {
  value: TicketStatus | "";
  onChange: (value: TicketStatus | "") => void;
}

export const FilterDropdown = ({ value, onChange }: Props) => {
  const statusLabel = useStatusLabel();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TicketStatus | "")}
      className="field w-auto"
    >
      <option value="">All statuses</option>
      {TICKET_STATUSES.map((status) => (
        <option key={status} value={status}>
          {statusLabel(status)}
        </option>
      ))}
    </select>
  );
};
