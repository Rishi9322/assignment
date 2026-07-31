import { SORT_FIELDS, SORT_FIELD_LABELS } from "../types/ticket";
import type { SortField, SortOrder } from "../types/ticket";

interface Props {
  sort: SortField;
  order: SortOrder;
  onChange: (sort: SortField, order: SortOrder) => void;
}

export const SortControl = ({ sort, order, onChange }: Props) => (
  <div className="flex items-center gap-1">
    <select
      value={sort}
      onChange={(e) => onChange(e.target.value as SortField, order)}
      className="field w-auto"
      aria-label="Sort by"
    >
      {SORT_FIELDS.map((f) => (
        <option key={f} value={f}>
          Sort: {SORT_FIELD_LABELS[f]}
        </option>
      ))}
    </select>
    <button
      type="button"
      onClick={() => onChange(sort, order === "asc" ? "desc" : "asc")}
      title={order === "asc" ? "Ascending" : "Descending"}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-secondary hover:text-ink"
    >
      {order === "asc" ? "↑" : "↓"}
    </button>
  </div>
);
