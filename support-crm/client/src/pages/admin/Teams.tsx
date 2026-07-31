import { useTeamWorkload } from "../../hooks/useTeamWorkload";
import { Loader } from "../../components/Loader";
import type { TeamWorkload } from "../../types/admin";

const pressureTone = (score: number) => {
  if (score >= 60) return { bar: "bg-danger", text: "text-danger", label: "High" };
  if (score >= 25) return { bar: "bg-warning", text: "text-warning", label: "Moderate" };
  return { bar: "bg-success", text: "text-success", label: "Low" };
};

const TeamCard = ({ w }: { w: TeamWorkload }) => {
  const tone = pressureTone(w.pressure_score);
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-ink">{w.team}</h2>
        <span className={`text-xs font-medium ${tone.text}`}>{tone.label} pressure</span>
      </div>

      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{ width: `${Math.min(100, w.pressure_score)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-ink-muted">Pressure score {w.pressure_score}/100</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-secondary">Backlog</dt>
          <dd className="text-lg font-semibold text-ink">{w.backlog}</dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Unassigned</dt>
          <dd className="text-lg font-semibold text-ink">{w.unassigned}</dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Overdue</dt>
          <dd className={`text-lg font-semibold ${w.overdue > 0 ? "text-danger" : "text-ink"}`}>
            {w.overdue}
          </dd>
        </div>
        <div>
          <dt className="text-ink-secondary">At risk</dt>
          <dd className={`text-lg font-semibold ${w.at_risk > 0 ? "text-warning" : "text-ink"}`}>
            {w.at_risk}
          </dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Urgent</dt>
          <dd className="text-lg font-semibold text-ink">{w.urgent}</dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Aging (3d+)</dt>
          <dd className="text-lg font-semibold text-ink">{w.aging}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-ink-muted">
        {w.resolved} resolved
        {w.reopen_rate !== null && ` · ${Math.round(w.reopen_rate * 100)}% reopened`}
      </p>
    </div>
  );
};

export const AdminTeams = () => {
  const { data: workloads, isLoading } = useTeamWorkload();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Teams</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Backlog and pressure per team — a deterministic score from backlog size, urgent load,
        SLA breaches, and aging tickets, not a prediction.
      </p>

      <div className="mt-6">
        {isLoading && <Loader />}
        {workloads && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {workloads.map((w) => (
              <TeamCard key={w.team} w={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
