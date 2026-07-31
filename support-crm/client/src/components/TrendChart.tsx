import { useState } from "react";
import type { TrendPoint } from "../types/ticket";

interface Props {
  data: TrendPoint[];
}

const formatShortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const TrendChart = ({ data }: Props) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-ink-muted">
        No tickets created in the last 14 days.
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex h-40 gap-[3px] border-b border-line">
        {data.map((point, i) => {
          const heightPct = Math.max(3, (point.count / max) * 100);
          return (
            <div
              key={point.date}
              className="group relative flex flex-1 flex-col justify-end"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {hovered === i && (
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-app shadow-lg">
                  {formatShortDate(point.date)} · {point.count} ticket{point.count === 1 ? "" : "s"}
                </div>
              )}
              <div
                className={`rounded-t transition-colors ${
                  hovered === i ? "bg-accent-hover" : "bg-accent"
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>{formatShortDate(data[0].date)}</span>
        <span>{formatShortDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
};
