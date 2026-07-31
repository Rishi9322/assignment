import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../services/ticket.service";
import { useToast } from "../components/Toast";
import { useAuth } from "../hooks/useAuth";
import { PRIORITIES } from "../types/ticket";
import type { Priority } from "../types/ticket";

export const CreateTicket = () => {
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    subject: "",
    description: "",
    priority: "Medium" as Priority,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: () => ticketService.create(form),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      showToast(`Ticket ${data.ticket_id} created`);
      navigate(`/tickets/${data.ticket_id}`);
    },
    onError: () => showToast("Failed to create ticket", "error"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const field = (key: "customer_name" | "customer_email" | "subject" | "description") => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">New Ticket</h1>
      {user && <p className="mt-1 text-sm text-ink-secondary">Logging as {user.name}</p>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label">Customer name</label>
          <input required className="field mt-1" {...field("customer_name")} />
        </div>
        <div>
          <label className="label">Customer email</label>
          <input required type="email" className="field mt-1" {...field("customer_email")} />
        </div>
        <div>
          <label className="label">Subject</label>
          <input required className="field mt-1" {...field("subject")} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required rows={5} className="field mt-1" {...field("description")} />
        </div>
        <div>
          <label className="label">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
            className="field mt-1"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink-muted">
            Sets the resolution deadline (Urgent: 4h, High: 1d, Medium: 3d, Low: 7d).
          </p>
        </div>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
};
