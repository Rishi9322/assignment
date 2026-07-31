import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useVendors } from "../hooks/useVendors";
import { vendorService } from "../services/vendor.service";
import { useToast } from "../components/Toast";
import { Loader } from "../components/Loader";
import { VENDOR_TYPES } from "../types/vendor";
import type { VendorType } from "../types/vendor";

export const Vendors = () => {
  const { data: vendors, isLoading } = useVendors();
  const [form, setForm] = useState({
    name: "",
    type: "Temporary" as VendorType,
    contact_email: "",
    contact_phone: "",
    notes: "",
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const createMutation = useMutation({
    mutationFn: () =>
      vendorService.create({
        name: form.name,
        type: form.type,
        contact_email: form.contact_email.trim() || undefined,
        contact_phone: form.contact_phone.trim() || undefined,
        notes: form.notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setForm({ name: "", type: "Temporary", contact_email: "", contact_phone: "", notes: "" });
      showToast("Vendor added");
    },
    onError: () => showToast("Failed to add vendor", "error"),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Third-Party Vendors</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Companies tickets can be routed to when an issue needs to be outsourced.
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        Reliability score is a deterministic blend of average resolution time and reopen rate on
        tickets currently assigned to each vendor — not a prediction.
      </p>

      <div className="card mt-6 p-6">
        <h2 className="text-lg font-semibold text-ink">Add a vendor</h2>
        <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Company name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="field mt-1"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as VendorType }))}
              className="field mt-1"
            >
              {VENDOR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Contact email</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
              className="field mt-1"
            />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input
              value={form.contact_phone}
              onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
              className="field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? "Adding..." : "Add vendor"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6">
        {isLoading && <Loader />}
        {vendors && vendors.length === 0 && (
          <div className="rounded-md border border-dashed border-line py-16 text-center text-sm text-ink-secondary">
            No vendors yet.
          </div>
        )}
        {vendors && vendors.length > 0 && (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-line text-sm">
              <thead className="bg-surface-alt">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Reliability</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Contact</th>
                  <th className="px-4 py-2 text-left font-medium text-ink-secondary">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-medium text-ink">{v.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          v.type === "Fixed"
                            ? "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300"
                        }`}
                      >
                        {v.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.reliability && v.reliability.score !== null ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                              v.reliability.score >= 70
                                ? "bg-success-soft text-success"
                                : v.reliability.score >= 40
                                  ? "bg-warning-soft text-warning"
                                  : "bg-danger-soft text-danger"
                            }`}
                          >
                            {v.reliability.score}
                          </span>
                          <span className="text-xs text-ink-secondary">
                            {v.reliability.tickets_resolved} resolved ·{" "}
                            {v.reliability.avg_resolution_hours}h avg ·{" "}
                            {Math.round((v.reliability.reopen_rate ?? 0) * 100)}% reopened
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted">No resolved tickets yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {[v.contact_email, v.contact_phone].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{v.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
