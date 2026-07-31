import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContact } from "../hooks/useContact";
import { contactService } from "../services/contact.service";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Loader } from "../components/Loader";
import { useToast } from "../components/Toast";
import { formatDate } from "../utils/date";

export const ContactDetail = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const id = contactId ? Number(contactId) : undefined;
  const { data: contact, isLoading } = useContact(id);
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (contact) {
      setPhone(contact.phone ?? "");
      setCompany(contact.company ?? "");
      setNotes(contact.notes ?? "");
    }
  }, [contact]);

  const updateMutation = useMutation({
    mutationFn: () =>
      contactService.update(id as number, {
        phone: phone.trim() || null,
        company: company.trim() || null,
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", id] });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      showToast("Contact updated");
    },
    onError: () => showToast("Failed to update contact", "error"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (isLoading) return <Loader />;
  if (!contact) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-danger">Contact not found.</p>
        <Link to="/contacts" className="mt-2 inline-block text-sm text-accent hover:underline">
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/contacts" className="text-sm text-accent hover:underline">
        ← Back to contacts
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">{contact.name}</h1>
          <p className="text-sm text-ink-secondary">{contact.email}</p>
        </div>
        {contact.tickets.length > 1 && (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Repeat customer · {contact.tickets.length} tickets
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-ink">Ticket history</h2>
            <ul className="mt-3 divide-y divide-line">
              {contact.tickets.length === 0 && (
                <li className="py-3 text-sm text-ink-secondary">No tickets yet.</li>
              )}
              {contact.tickets.map((t) => (
                <li key={t.ticket_id} className="py-3">
                  <Link
                    to={`/tickets/${t.ticket_id}`}
                    className="flex items-center justify-between gap-2 hover:bg-surface-alt"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{t.subject}</p>
                      <p className="text-xs text-ink-muted">
                        {t.ticket_id} · {formatDate(t.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-4">
          <h2 className="text-sm font-semibold text-ink">Account details</h2>
          <div className="mt-3">
            <label className="label">Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="field mt-1"
            />
          </div>
          <div className="mt-3">
            <label className="label">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field mt-1" />
          </div>
          <div className="mt-3">
            <label className="label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="field mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary mt-4 w-full"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
          <p className="mt-4 text-xs text-ink-muted">
            Customer since {formatDate(contact.created_at)}
          </p>
        </form>
      </div>
    </div>
  );
};
