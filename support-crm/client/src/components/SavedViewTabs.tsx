import { SAVED_VIEWS, SAVED_VIEW_LABELS } from "../types/ticket";
import type { SavedView } from "../types/ticket";

interface Props {
  value: SavedView;
  onChange: (value: SavedView) => void;
}

export const SavedViewTabs = ({ value, onChange }: Props) => (
  <div className="flex gap-1 border-b border-line">
    {SAVED_VIEWS.map((view) => (
      <button
        key={view}
        type="button"
        onClick={() => onChange(view)}
        className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
          value === view
            ? "border-accent text-accent"
            : "border-transparent text-ink-secondary hover:text-ink"
        }`}
      >
        {SAVED_VIEW_LABELS[view]}
      </button>
    ))}
  </div>
);
