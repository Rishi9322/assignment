import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAdminSettings, useUpdateSettings } from "../../hooks/useSettings";
import { useToast } from "../../components/Toast";
import { Loader } from "../../components/Loader";
import { PRIORITIES, STATUS_LABELS, TICKET_STATUSES } from "../../types/ticket";

export const AdminSettings = () => {
  const { data: settings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateSettings();
  const { showToast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [accentColor, setAccentColor] = useState("#2563eb");
  const [statusLabels, setStatusLabels] = useState<Record<string, string>>({});
  const [priorityLabels, setPriorityLabels] = useState<Record<string, string>>({});
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState("10080");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [lockoutMinutes, setLockoutMinutes] = useState("15");

  useEffect(() => {
    if (!settings) return;
    setOrgName(settings.org_name);
    setSupportEmail(settings.support_email ?? "");
    setAccentColor(settings.accent_color);
    setStatusLabels(settings.status_labels);
    setPriorityLabels(settings.priority_labels);
    setSessionTimeoutMinutes(String(settings.session_timeout_minutes));
    setMaxLoginAttempts(String(settings.max_login_attempts));
    setLockoutMinutes(String(settings.lockout_minutes));
  }, [settings]);

  const handleSaveSecurity = (e: FormEvent) => {
    e.preventDefault();
    const sessionTimeout = Number(sessionTimeoutMinutes);
    const maxAttempts = Number(maxLoginAttempts);
    const lockout = Number(lockoutMinutes);
    if (!Number.isInteger(sessionTimeout) || sessionTimeout < 5) {
      showToast("Session timeout must be at least 5 minutes", "error");
      return;
    }
    if (!Number.isInteger(maxAttempts) || maxAttempts < 3) {
      showToast("Max login attempts must be at least 3", "error");
      return;
    }
    if (!Number.isInteger(lockout) || lockout < 1) {
      showToast("Lockout duration must be at least 1 minute", "error");
      return;
    }
    updateMutation.mutate(
      {
        session_timeout_minutes: sessionTimeout,
        max_login_attempts: maxAttempts,
        lockout_minutes: lockout,
      },
      {
        onSuccess: () => showToast("Security settings updated"),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update security settings", "error"),
      }
    );
  };

  const handleSaveBranding = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        org_name: orgName.trim() || undefined,
        support_email: supportEmail.trim() || null,
        accent_color: accentColor,
      },
      {
        onSuccess: () => showToast("Branding updated"),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update branding", "error"),
      }
    );
  };

  const handleSaveLabels = (e: FormEvent) => {
    e.preventDefault();
    // Blank inputs mean "no override" — omit them rather than sending an
    // empty string, which the server rejects (labels must be non-empty).
    const nonEmpty = (obj: Record<string, string>) =>
      Object.fromEntries(Object.entries(obj).filter(([, v]) => v.trim() !== ""));
    updateMutation.mutate(
      { status_labels: nonEmpty(statusLabels), priority_labels: nonEmpty(priorityLabels) },
      {
        onSuccess: () => showToast("Labels updated"),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update labels", "error"),
      }
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">System settings</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Organization branding and display labels for statuses and priorities.
      </p>

      <form onSubmit={handleSaveBranding} className="mt-6 card space-y-4 p-5">
        <h2 className="text-sm font-semibold text-ink">Branding</h2>
        <div>
          <label className="label">Organization name</label>
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="field mt-1" />
        </div>
        <div>
          <label className="label">Support email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@example.com"
            className="field mt-1"
          />
        </div>
        <div>
          <label className="label">Accent color</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-line bg-transparent"
            />
            <input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="field w-32"
            />
          </div>
        </div>
        <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
          {updateMutation.isPending ? "Saving..." : "Save branding"}
        </button>
      </form>

      <form onSubmit={handleSaveLabels} className="mt-6 card space-y-4 p-5">
        <h2 className="text-sm font-semibold text-ink">Display labels</h2>
        <p className="text-xs text-ink-muted">
          Rename how statuses and priorities appear across the app. The underlying workflow and
          SLA rules are unaffected — only the label shown to users changes.
        </p>

        <div>
          <p className="label mb-2">Status labels</p>
          <div className="space-y-2">
            {TICKET_STATUSES.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span className="w-40 shrink-0 text-xs text-ink-secondary">
                  {STATUS_LABELS[status]}
                </span>
                <input
                  value={statusLabels[status] ?? ""}
                  onChange={(e) =>
                    setStatusLabels((prev) => ({ ...prev, [status]: e.target.value }))
                  }
                  placeholder={STATUS_LABELS[status]}
                  className="field flex-1 py-1"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="label mb-2">Priority labels</p>
          <div className="space-y-2">
            {PRIORITIES.map((priority) => (
              <div key={priority} className="flex items-center gap-2">
                <span className="w-40 shrink-0 text-xs text-ink-secondary">{priority}</span>
                <input
                  value={priorityLabels[priority] ?? ""}
                  onChange={(e) =>
                    setPriorityLabels((prev) => ({ ...prev, [priority]: e.target.value }))
                  }
                  placeholder={priority}
                  className="field flex-1 py-1"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
          {updateMutation.isPending ? "Saving..." : "Save labels"}
        </button>
      </form>

      <form onSubmit={handleSaveSecurity} className="mt-6 card space-y-4 p-5">
        <h2 className="text-sm font-semibold text-ink">Security</h2>
        <div>
          <label className="label">Session timeout (minutes)</label>
          <input
            type="number"
            min={5}
            value={sessionTimeoutMinutes}
            onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
            className="field mt-1 w-40"
          />
          <p className="mt-1 text-xs text-ink-muted">
            How long a login stays valid before requiring sign-in again. Applies to sessions
            issued after this is saved.
          </p>
        </div>
        <div>
          <label className="label">Max failed login attempts</label>
          <input
            type="number"
            min={3}
            value={maxLoginAttempts}
            onChange={(e) => setMaxLoginAttempts(e.target.value)}
            className="field mt-1 w-40"
          />
        </div>
        <div>
          <label className="label">Lockout duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={lockoutMinutes}
            onChange={(e) => setLockoutMinutes(e.target.value)}
            className="field mt-1 w-40"
          />
          <p className="mt-1 text-xs text-ink-muted">
            How long an account stays locked after exceeding the failed-attempt limit. Admins can
            also unlock an account immediately from the Users page.
          </p>
        </div>
        <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
          {updateMutation.isPending ? "Saving..." : "Save security settings"}
        </button>
      </form>
    </div>
  );
};
