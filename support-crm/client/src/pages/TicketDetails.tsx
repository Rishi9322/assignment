import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTicket } from "../hooks/useTicket";
import { useEmployees } from "../hooks/useEmployees";
import { useVendors } from "../hooks/useVendors";
import { useTeams } from "../hooks/useTeams";
import { usePriorityLabel, useStatusLabel } from "../hooks/useLabels";
import { ticketService } from "../services/ticket.service";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Loader } from "../components/Loader";
import { useToast } from "../components/Toast";
import { TicketTimeline } from "../components/TicketTimeline";
import { AttachmentPanel } from "../components/AttachmentPanel";
import { formatDate, formatRelativeDue } from "../utils/date";
import {
  BLOCKED_STATUSES,
  PRIORITIES,
  TERMINAL_STATUSES,
  TICKET_STATUSES,
} from "../types/ticket";
import type { Priority, Team, TicketStatus } from "../types/ticket";

export const TicketDetails = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { data: ticket, isLoading, isError } = useTicket(ticketId);
  const { data: employees } = useEmployees();
  const { data: vendors } = useVendors();
  const { data: teams = [] } = useTeams();
  const statusLabel = useStatusLabel();
  const priorityLabel = usePriorityLabel();
  const [note, setNote] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [team, setTeam] = useState<Team | "">("");
  const [assignedToUserId, setAssignedToUserId] = useState<number | "">("");
  const [vendorId, setVendorId] = useState<number | "">("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (ticket) {
      setTeam(ticket.team ?? "");
      setAssignedToUserId(ticket.assigned_to?.id ?? "");
      setVendorId(ticket.vendor?.id ?? "");
      setNextAction(ticket.next_action ?? "");
    }
  }, [ticket]);

  const invalidateTicket = () => {
    queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: TicketStatus; notes?: string }) =>
      ticketService.updateStatus(ticketId as string, status, notes),
    onSuccess: () => {
      invalidateTicket();
      setReopenReason("");
      showToast("Status updated");
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? "Failed to update status", "error"),
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: Priority) => ticketService.updatePriority(ticketId as string, priority),
    onSuccess: () => {
      invalidateTicket();
      showToast("Priority updated");
    },
    onError: () => showToast("Failed to update priority", "error"),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      ticketService.assign(ticketId as string, {
        team: team || null,
        assigned_to_user_id: assignedToUserId || null,
        vendor_id: vendorId || null,
      }),
    onSuccess: () => {
      invalidateTicket();
      showToast("Ticket assigned");
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.error ?? "Failed to assign ticket", "error"),
  });

  const noteMutation = useMutation({
    mutationFn: () => ticketService.addNote(ticketId as string, note),
    onSuccess: () => {
      invalidateTicket();
      setNote("");
      showToast("Note added");
    },
    onError: () => showToast("Failed to add note", "error"),
  });

  const nextActionMutation = useMutation({
    mutationFn: () => ticketService.updateNextAction(ticketId as string, nextAction.trim() || null),
    onSuccess: () => {
      invalidateTicket();
      showToast("Next action saved");
    },
    onError: () => showToast("Failed to save next action", "error"),
  });

  const handleAddNote = (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    noteMutation.mutate();
  };

  const handleSaveNextAction = (e: FormEvent) => {
    e.preventDefault();
    nextActionMutation.mutate();
  };

  const handleAssign = (e: FormEvent) => {
    e.preventDefault();
    assignMutation.mutate();
  };

  const handleStatusChange = (status: TicketStatus) => {
    if (!ticket) return;
    const wasTerminal = TERMINAL_STATUSES.includes(ticket.status);
    if (wasTerminal && !TERMINAL_STATUSES.includes(status)) {
      // Reopening a resolved/closed ticket — capture a reason for the audit trail.
      const reason = window.prompt("Reason for reopening this ticket?", reopenReason) ?? "";
      statusMutation.mutate({ status, notes: reason || undefined });
      return;
    }
    const enteringBlocked =
      BLOCKED_STATUSES.includes(status) && !BLOCKED_STATUSES.includes(ticket.status);
    if (enteringBlocked) {
      // Waiting on the customer or a vendor is only useful info if we also know
      // why — captured as a dedicated "blocked" timeline event, not a plain note.
      const reason = window.prompt("Why is this ticket waiting?") ?? "";
      statusMutation.mutate({ status, notes: reason || undefined });
      return;
    }
    statusMutation.mutate({ status });
  };

  if (isLoading) return <Loader />;
  if (isError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-danger">Ticket not found.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-sm text-accent hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/dashboard" className="text-sm text-accent hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {ticket.ticket_id}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
          {ticket.overdue && (
            <span className="inline-flex items-center whitespace-nowrap rounded-full bg-danger px-2.5 py-0.5 text-xs font-medium text-white">
              Overdue
            </span>
          )}
          {!ticket.overdue && ticket.at_risk && (
            <span className="inline-flex items-center whitespace-nowrap rounded-full bg-warning px-2.5 py-0.5 text-xs font-medium text-white">
              At Risk
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink-secondary">Customer</dt>
                <dd className="text-ink">
                  {ticket.contact_id ? (
                    <Link
                      to={`/contacts/${ticket.contact_id}`}
                      className="text-accent hover:underline"
                    >
                      {ticket.customer_name}
                    </Link>
                  ) : (
                    ticket.customer_name
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-ink-secondary">Email</dt>
                <dd className="text-ink">{ticket.customer_email}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <dt className="text-sm text-ink-secondary">Description</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {ticket.description}
              </dd>
            </div>
          </div>

          <AttachmentPanel ticketId={ticket.ticket_id} />

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink">Activity</h2>

            <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="field flex-1"
              />
              <button type="submit" disabled={noteMutation.isPending} className="btn-primary">
                Add
              </button>
            </form>

            <div className="mt-5">
              <TicketTimeline events={ticket.events} />
            </div>
          </div>
        </div>

        {/* Decision sidebar */}
        <div className="space-y-6">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-ink">Status &amp; priority</h2>
            <div className="mt-3">
              <label className="label">Status</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                disabled={statusMutation.isPending}
                className="field mt-1"
              >
                {TICKET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label className="label">Priority</label>
              <select
                value={ticket.priority}
                onChange={(e) => priorityMutation.mutate(e.target.value as Priority)}
                disabled={priorityMutation.isPending}
                className="field mt-1"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            {ticket.reopen_count > 0 && (
              <p className="mt-3 text-xs text-warning">
                Reopened {ticket.reopen_count} time{ticket.reopen_count === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <form onSubmit={handleSaveNextAction} className="card p-4">
            <h2 className="text-sm font-semibold text-ink">Next action</h2>
            <p className="mt-1 text-xs text-ink-muted">
              What does whoever picks this up next need to do? Kept separate from notes so it
              never gets buried in the timeline.
            </p>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              rows={2}
              placeholder="e.g. Wait for vendor confirmation, then verify with customer"
              className="field mt-3"
            />
            <button
              type="submit"
              disabled={nextActionMutation.isPending}
              className="btn-primary mt-2 w-full"
            >
              {nextActionMutation.isPending ? "Saving..." : "Save"}
            </button>
          </form>

          <div className="card p-4">
            <h2 className="text-sm font-semibold text-ink">SLA</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Due</dt>
                <dd
                  className={
                    ticket.overdue
                      ? "font-medium text-danger"
                      : ticket.at_risk
                        ? "font-medium text-warning"
                        : "text-ink"
                  }
                >
                  {ticket.due_at ? formatRelativeDue(ticket.due_at) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">First response</dt>
                <dd className="text-ink">
                  {ticket.first_responded_at ? formatDate(ticket.first_responded_at) : "Pending"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Resolved</dt>
                <dd className="text-ink">
                  {ticket.resolved_at ? formatDate(ticket.resolved_at) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <form onSubmit={handleAssign} className="card p-4">
            <h2 className="text-sm font-semibold text-ink">Assignment</h2>
            <p className="mt-1 text-xs text-ink-muted">
              An employee and a vendor can't both own a ticket — setting one clears the other.
            </p>
            <div className="mt-3">
              <label className="label">Team</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as Team | "")}
                className="field mt-1"
              >
                <option value="">Unassigned</option>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label className="label">Employee</label>
              <select
                value={assignedToUserId}
                onChange={(e) => {
                  setAssignedToUserId(e.target.value ? Number(e.target.value) : "");
                  if (e.target.value) setVendorId("");
                }}
                className="field mt-1"
              >
                <option value="">Unassigned</option>
                {employees?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label className="label">Vendor</label>
              <select
                value={vendorId}
                onChange={(e) => {
                  setVendorId(e.target.value ? Number(e.target.value) : "");
                  if (e.target.value) setAssignedToUserId("");
                }}
                className="field mt-1"
              >
                <option value="">None</option>
                {vendors?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="btn-primary mt-4 w-full"
            >
              {assignMutation.isPending ? "Saving..." : "Save assignment"}
            </button>
          </form>

          <div className="card p-4 text-sm">
            <h2 className="text-sm font-semibold text-ink">Details</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Created by</dt>
                <dd className="text-ink">{ticket.created_by.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Created</dt>
                <dd className="text-ink">{formatDate(ticket.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-secondary">Updated</dt>
                <dd className="text-ink">{formatDate(ticket.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
