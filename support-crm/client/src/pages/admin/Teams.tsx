import { useState } from "react";
import type { FormEvent } from "react";
import { useTeamWorkload } from "../../hooks/useTeamWorkload";
import { useCreateTeam, useTeamDirectory, useUpdateTeam } from "../../hooks/useTeamDirectory";
import { Loader } from "../../components/Loader";
import { useToast } from "../../components/Toast";
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

const TeamDirectoryManager = () => {
  const { data: teams, isLoading } = useTeamDirectory();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const { showToast } = useToast();
  const [name, setName] = useState("");

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createTeam.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setName("");
          showToast("Team created");
        },
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to create team", "error"),
      }
    );
  };

  const toggleArchived = (id: number, archived: boolean) => {
    updateTeam.mutate(
      { id, payload: { archived } },
      {
        onSuccess: () => showToast(archived ? "Team archived" : "Team reactivated"),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update team", "error"),
      }
    );
  };

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-ink">Team directory</h2>
      <p className="mt-1 text-xs text-ink-muted">
        Archived teams stay on existing tickets but drop out of the assignment and filter dropdowns.
      </p>

      <form onSubmit={handleCreate} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New team name"
          className="field flex-1"
        />
        <button
          type="submit"
          disabled={createTeam.isPending || !name.trim()}
          className="btn-primary shrink-0"
        >
          Add team
        </button>
      </form>

      <div className="mt-4">
        {isLoading && <Loader />}
        {teams && (
          <ul className="divide-y divide-line">
            {teams.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <span className={t.archived ? "text-ink-muted line-through" : "text-ink"}>
                  {t.name}
                </span>
                <button
                  onClick={() => toggleArchived(t.id, !t.archived)}
                  disabled={updateTeam.isPending}
                  className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                >
                  {t.archived ? "Reactivate" : "Archive"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
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
        <TeamDirectoryManager />
      </div>

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
