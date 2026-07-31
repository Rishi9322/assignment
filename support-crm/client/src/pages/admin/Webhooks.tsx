import { useState } from "react";
import type { FormEvent } from "react";
import {
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhookDeliveries,
  useWebhooks,
} from "../../hooks/useWebhooks";
import { Loader } from "../../components/Loader";
import { useToast } from "../../components/Toast";
import { formatDate } from "../../utils/date";
import type { Webhook } from "../../types/webhook";

const DeliveryLog = ({ webhookId }: { webhookId: number }) => {
  const { data: deliveries, isLoading } = useWebhookDeliveries(webhookId);

  if (isLoading) return <Loader />;
  if (!deliveries || deliveries.length === 0) {
    return <p className="text-xs text-ink-muted">No deliveries yet.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {deliveries.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
          <span className="text-ink">{d.event_type}</span>
          <span className={d.success ? "text-success" : "text-danger"}>
            {d.status_code ?? "—"} {d.success ? "OK" : d.error ?? "failed"}
          </span>
          <span className="text-ink-muted">{formatDate(d.created_at)}</span>
        </li>
      ))}
    </ul>
  );
};

const WebhookRow = ({ webhook }: { webhook: Webhook }) => {
  const [expanded, setExpanded] = useState(false);
  const updateMutation = useUpdateWebhook();
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();
  const { showToast } = useToast();

  const toggleActive = () => {
    updateMutation.mutate(
      { id: webhook.id, payload: { active: !webhook.active } },
      {
        onSuccess: () => showToast(webhook.active ? "Webhook paused" : "Webhook resumed"),
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to update webhook", "error"),
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete the webhook for ${webhook.url}?`)) return;
    deleteMutation.mutate(webhook.id, {
      onSuccess: () => showToast("Webhook deleted"),
      onError: () => showToast("Failed to delete webhook", "error"),
    });
  };

  const handleTest = () => {
    testMutation.mutate(webhook.id, {
      onSuccess: () => showToast("Test delivery sent — check the log below"),
      onError: () => showToast("Failed to send test delivery", "error"),
    });
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{webhook.url}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {webhook.events.map((e) => (
              <span
                key={e}
                className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-secondary"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            webhook.active ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}
        >
          {webhook.active ? "Active" : "Paused"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
        <button onClick={handleTest} disabled={testMutation.isPending} className="text-accent hover:underline">
          Send test
        </button>
        <button onClick={toggleActive} disabled={updateMutation.isPending} className="text-accent hover:underline">
          {webhook.active ? "Pause" : "Resume"}
        </button>
        <button onClick={() => setExpanded((v) => !v)} className="text-accent hover:underline">
          {expanded ? "Hide deliveries" : "Show deliveries"}
        </button>
        <button onClick={handleDelete} disabled={deleteMutation.isPending} className="text-danger hover:underline">
          Delete
        </button>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-line pt-3">
          <DeliveryLog webhookId={webhook.id} />
        </div>
      )}
    </div>
  );
};

const CreateWebhookForm = ({ availableEvents }: { availableEvents: string[] }) => {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const createMutation = useCreateWebhook();
  const { showToast } = useToast();

  const toggleEvent = (event: string) => {
    setEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || events.length === 0) return;
    createMutation.mutate(
      { url: url.trim(), events },
      {
        onSuccess: (webhook) => {
          setNewSecret(webhook.secret);
          setUrl("");
          setEvents([]);
          showToast("Webhook created");
        },
        onError: (err: any) =>
          showToast(err?.response?.data?.error ?? "Failed to create webhook", "error"),
      }
    );
  };

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-ink">Add webhook</h2>
      <p className="mt-1 text-xs text-ink-muted">
        We'll POST a JSON payload to this URL for each subscribed event, signed with an
        HMAC-SHA256 signature in the <code>X-Webhook-Signature</code> header.
      </p>

      {newSecret && (
        <div className="mt-3 rounded-md border border-warning bg-warning-soft p-3 text-xs text-ink">
          <p className="font-medium">Signing secret (shown once — copy it now):</p>
          <code className="mt-1 block break-all rounded bg-surface px-2 py-1">{newSecret}</code>
          <button onClick={() => setNewSecret(null)} className="mt-2 text-accent hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="label">Endpoint URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/webhooks/support-crm"
            className="field mt-1"
          />
        </div>
        <div>
          <label className="label">Events</label>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {availableEvents.map((event) => (
              <label key={event} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={events.includes(event)}
                  onChange={() => toggleEvent(event)}
                />
                {event}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending || !url.trim() || events.length === 0}
          className="btn-primary"
        >
          {createMutation.isPending ? "Creating..." : "Create webhook"}
        </button>
      </form>
    </div>
  );
};

export const AdminWebhooks = () => {
  const { data, isLoading } = useWebhooks();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-ink">Webhooks</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Notify external systems in real time when tickets are created, updated, or commented on.
      </p>

      <div className="mt-6 space-y-6">
        {isLoading && <Loader />}
        {data && <CreateWebhookForm availableEvents={data.available_events} />}
        {data && data.webhooks.length > 0 && (
          <div className="space-y-4">
            {data.webhooks.map((w) => (
              <WebhookRow key={w.id} webhook={w} />
            ))}
          </div>
        )}
        {data && data.webhooks.length === 0 && (
          <p className="text-sm text-ink-secondary">No webhooks configured yet.</p>
        )}
      </div>
    </div>
  );
};
