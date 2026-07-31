import { useEffect, useState } from "react";
import { useSlaRules, useUpdateSlaRule } from "../../hooks/useSlaRules";
import { Loader } from "../../components/Loader";
import { useToast } from "../../components/Toast";
import { PriorityBadge } from "../../components/PriorityBadge";
import type { SlaRule } from "../../types/slaRule";

const formatWindow = (hours: number) => {
  if (hours % 24 === 0 && hours >= 24) return `${hours / 24} day${hours / 24 === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"}`;
};

const RuleRow = ({ rule }: { rule: SlaRule }) => {
  const [hours, setHours] = useState(String(rule.hours));
  const updateMutation = useUpdateSlaRule();
  const { showToast } = useToast();

  useEffect(() => {
    setHours(String(rule.hours));
  }, [rule.hours]);

  const dirty = Number(hours) !== rule.hours;

  const handleSave = () => {
    const parsed = Number(hours);
    if (!Number.isInteger(parsed) || parsed < 1) {
      showToast("Enter a whole number of hours (1 or more)", "error");
      return;
    }
    updateMutation.mutate(
      { priority: rule.priority, hours: parsed },
      {
        onSuccess: () => showToast(`${rule.priority} SLA updated to ${formatWindow(parsed)}`),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update SLA rule", "error"),
      }
    );
  };

  return (
    <tr>
      <td className="px-4 py-3">
        <PriorityBadge priority={rule.priority} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="field w-24 py-1"
          />
          <span className="text-sm text-ink-secondary">hours ({formatWindow(Number(hours) || 0)})</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending}
          className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </button>
      </td>
    </tr>
  );
};

export const AdminSlaRules = () => {
  const { data: rules, isLoading } = useSlaRules();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">SLA rules</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        The resolution window for each priority. New tickets and priority changes use these
        hours to compute their due date; a ticket becomes "at risk" once 25% of its window
        remains.
      </p>

      <div className="mt-6">
        {isLoading && <Loader />}
        {rules && (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Priority</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">
                    Resolution window
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rules.map((r) => (
                  <RuleRow key={r.priority} rule={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
