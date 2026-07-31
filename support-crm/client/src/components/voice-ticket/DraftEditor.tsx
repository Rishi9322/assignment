import React from 'react';
import { Link } from 'react-router-dom';
import type { TicketDraft } from '../../types/voice-ticket';

interface Props {
  draft: TicketDraft | null;
  isProcessing: boolean;
  onUpdate: (updates: Partial<TicketDraft>) => void;
  onRegenerate: () => void;
  onConfirm: () => Promise<{ ticket_id: string } | null>;
  isSubmitting: boolean;
  submitError: string | null;
  confirmedTicketId: string | null;
}

export const DraftEditor: React.FC<Props> = ({
  draft,
  isProcessing,
  onUpdate,
  onRegenerate,
  onConfirm,
  isSubmitting,
  submitError,
  confirmedTicketId,
}) => {
  if (isProcessing) return <div className="p-8 text-center border rounded-2xl">Extracting draft…</div>;
  if (!draft) return <div className="p-8 text-center border rounded-2xl text-slate-400">Draft will appear after recording stops.</div>;

  if (confirmedTicketId) {
    return (
      <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 h-[420px] flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-green-600">Ticket created</p>
        <p className="text-sm text-slate-500">{confirmedTicketId}</p>
        <Link to={`/tickets/${confirmedTicketId}`} className="text-sm text-blue-600 hover:underline">
          Open ticket →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-4 h-[420px] overflow-auto">
      <div className="flex justify-between items-center">
        <div className="font-semibold">Ticket Draft</div>
        <div className="flex gap-2">
          <button onClick={onRegenerate} className="text-xs px-3 py-1 border rounded">Regenerate</button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="text-xs px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : 'Confirm & create ticket'}
          </button>
        </div>
      </div>

      {/* Keyword-matched draft — always reviewed before it becomes a real ticket. */}
      <input
        className="w-full p-3 border rounded-xl text-lg font-medium"
        value={draft.title}
        onChange={e => onUpdate({ title: e.target.value })}
      />

      <textarea
        className="w-full h-32 p-3 border rounded-xl resize-y font-mono text-sm"
        value={draft.description}
        onChange={e => onUpdate({ description: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <input
          value={draft.customerName || ''}
          onChange={e => onUpdate({ customerName: e.target.value })}
          className="p-2 border rounded"
          placeholder="Customer name"
        />
        <input
          value={draft.customerEmail || ''}
          onChange={e => onUpdate({ customerEmail: e.target.value })}
          className="p-2 border rounded"
          placeholder="customer@email.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <select value={draft.priority} onChange={e => onUpdate({ priority: e.target.value as any })} className="p-2 border rounded">
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
        </select>
        <input value={draft.category} onChange={e => onUpdate({ category: e.target.value })} className="p-2 border rounded" placeholder="Category" />
      </div>

      {draft.uncertaintyFlags.length > 0 && (
        <div className="text-xs bg-amber-50 dark:bg-amber-950 p-3 rounded border border-amber-200">
          <div className="font-medium mb-1">⚠️ Uncertainties ({draft.uncertaintyFlags.length})</div>
          {draft.uncertaintyFlags.map((f, i) => <div key={i}>• {f.field}: {f.reason} (conf {f.confidence})</div>)}
        </div>
      )}

      {submitError && (
        <div className="text-xs bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-3 rounded border border-red-200">
          {submitError}
        </div>
      )}
    </div>
  );
};
