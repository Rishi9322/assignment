import { useState } from "react";
import { useTickets } from "../hooks/useTickets";
import { useStats } from "../hooks/useStats";
import { useTrend } from "../hooks/useTrend";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SearchBar } from "../components/SearchBar";
import { FilterDropdown } from "../components/FilterDropdown";
import { TeamFilterDropdown } from "../components/TeamFilterDropdown";
import { TicketTable } from "../components/TicketTable";
import { TrendChart } from "../components/TrendChart";
import { RecentActivity } from "../components/RecentActivity";
import { Loader } from "../components/Loader";
import type { Team, TicketStatus } from "../types/ticket";

const TONE_STYLES = {
  default: { border: "card", label: "text-ink-secondary", value: "text-ink" },
  danger: { border: "border-danger/30 bg-danger-soft", label: "text-danger", value: "text-danger" },
  warning: {
    border: "border-warning/30 bg-warning-soft",
    label: "text-warning",
    value: "text-warning",
  },
} as const;

const StatCard = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | undefined;
  tone?: keyof typeof TONE_STYLES;
}) => {
  const active = tone !== "default" && !!value;
  const styles = TONE_STYLES[active ? tone : "default"];
  return (
    <div className={`rounded-md border p-4 ${styles.border}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${styles.label}`}>{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${styles.value}`}>{value ?? "-"}</p>
    </div>
  );
};

export const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [team, setTeam] = useState<Team | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const { data: tickets, isLoading, isError } = useTickets(
    status || undefined,
    debouncedSearch || undefined,
    team || undefined
  );
  const { data: stats } = useStats();
  const { data: trend } = useTrend();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={stats?.total} />
        <StatCard label="Open" value={stats?.open} />
        <StatCard label="In Progress" value={stats?.in_progress} />
        <StatCard label="Closed" value={stats?.closed} />
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Needs attention
        </p>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Unassigned" value={stats?.unassigned} tone="danger" />
          <StatCard label="Overdue" value={stats?.overdue} tone="danger" />
          <StatCard label="At Risk" value={stats?.at_risk} tone="warning" />
          <StatCard label="Blocked" value={stats?.blocked} />
          <StatCard
            label="Blocked, no next action"
            value={stats?.blocked_missing_next_action}
            tone="warning"
          />
          <StatCard label="Resolved Today" value={stats?.resolved_today} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Tickets created — last 14 days</h2>
          {trend ? (
            <div className="mt-3">
              <TrendChart data={trend} />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-ink-muted">
              Loading…
            </div>
          )}
        </div>
        <RecentActivity tickets={tickets ?? []} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <FilterDropdown value={status} onChange={setStatus} />
        <TeamFilterDropdown value={team} onChange={setTeam} />
      </div>

      <div className="mt-6">
        {isLoading && <Loader />}
        {isError && (
          <p className="text-sm text-danger">Failed to load tickets. Is the API running?</p>
        )}
        {tickets && <TicketTable tickets={tickets} />}
      </div>
    </div>
  );
};
