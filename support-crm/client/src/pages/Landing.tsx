import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "../components/ThemeToggle";

const FEATURES = [
  {
    title: "A lifecycle, not just a status",
    body: "Open → Triaged → In Progress → Waiting on Customer/Vendor → Resolved → Closed. Reopening a resolved ticket captures a reason and counts toward a reopen rate you can actually see.",
  },
  {
    title: "SLA that runs itself",
    body: "Every ticket gets a resolution deadline the moment a priority is set — 4 hours for Urgent, up to 7 days for Low. Overdue tickets surface on the dashboard before they're forgotten.",
  },
  {
    title: "A real audit trail",
    body: "Every status change, reassignment, priority bump, and note is a timestamped, attributed event — not a flat notes box. See exactly who did what, and when.",
  },
  {
    title: "One clear owner",
    body: "A ticket is owned by an employee or a vendor, never silently both. Routing to a team stays independent, so escalation and ownership never get confused.",
  },
  {
    title: "Vendor handoffs, tracked",
    body: "A dedicated vendor directory distinguishes long-term Fixed partners from one-off Temporary outsourcing, with contact details attached to every handoff.",
  },
  {
    title: "Passwordless-strength security",
    body: "Argon2id-hashed passwords by default, with optional WebAuthn passkey two-factor login — Windows Hello, Touch ID, or a hardware key, per account.",
  },
];

const STEPS = [
  { label: "Intake", detail: "A ticket is logged with customer context and a priority." },
  { label: "Triage", detail: "Routed to a team, an employee, or handed to a vendor." },
  { label: "Ownership", detail: "One clear owner — never a silent handoff." },
  { label: "Escalation", detail: "Reassign, reprioritize, or hand off — every step logged." },
  { label: "Resolution", detail: "Closed with a full timeline of how it got there." },
];

const PreviewMock = () => (
  <div className="card overflow-hidden text-left shadow-xl">
    <div className="flex items-center gap-2 border-b border-line bg-surface-alt px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
      <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
      <span className="ml-2 text-xs font-medium text-ink-muted">Dashboard</span>
    </div>
    <div className="grid grid-cols-4 gap-2 p-4">
      {[
        { label: "Unassigned", value: "3", tone: true },
        { label: "Overdue", value: "1", tone: true },
        { label: "Waiting on Vendor", value: "1", tone: false },
        { label: "Resolved Today", value: "4", tone: false },
      ].map((s) => (
        <div
          key={s.label}
          className={`rounded-md border p-2 ${s.tone ? "border-danger/30 bg-danger-soft" : "border-line bg-surface"}`}
        >
          <p className={`text-[10px] uppercase tracking-wide ${s.tone ? "text-danger" : "text-ink-muted"}`}>
            {s.label}
          </p>
          <p className={`text-lg font-semibold ${s.tone ? "text-danger" : "text-ink"}`}>{s.value}</p>
        </div>
      ))}
    </div>
    <div className="space-y-2 px-4 pb-4">
      {[
        { id: "TKT-014", subject: "Server outage impacting checkout", priority: "Urgent", tone: "bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300", overdue: true },
        { id: "TKT-011", subject: "Waiting on hardware vendor for repair", priority: "High", tone: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300", overdue: false },
        { id: "TKT-009", subject: "Billing discrepancy on last invoice", priority: "Medium", tone: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300", overdue: false },
      ].map((t) => (
        <div
          key={t.id}
          className={`flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2 ${t.overdue ? "border-l-2 border-l-danger" : ""}`}
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink">{t.subject}</p>
            <p className="text-[10px] text-ink-muted">{t.id}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${t.tone}`}>
            {t.priority}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const Landing = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-app text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-ink">Support CRM</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-sm text-ink-secondary hover:text-ink">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Support operations, not just tickets
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Where escalations get managed, not lost.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-secondary">
            Track every issue, route it clearly, and keep teams and vendors aligned from intake to
            resolution — with an SLA clock and a real audit trail behind every ticket.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">
              Create account
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface-alt"
            >
              Sign in
            </Link>
          </div>
        </div>
        <PreviewMock />
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            How the desk works
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-5">
            {STEPS.map((s, i) => (
              <div key={s.label} className="relative">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
                    {i + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-ink">{s.label}</h3>
                </div>
                <p className="mt-2 text-sm text-ink-secondary">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Features</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Built for real operational work</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-secondary">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security trust note */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                Security
              </p>
              <h3 className="mt-1 text-lg font-semibold text-ink">
                Argon2id hashing, JWT sessions, optional passkey two-factor
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
                Every account is hashed with Argon2id by default. Anyone can add a WebAuthn passkey
                from their Security settings — once added, login becomes a two-step: password,
                then a passkey assertion from Windows Hello, Touch ID, or a hardware key.
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
              ✓ Passkey-ready
            </span>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-muted">
        Support CRM — ticket lifecycle, SLA tracking, team &amp; vendor routing, and a full audit
        trail, in one desk.
      </footer>
    </div>
  );
};
