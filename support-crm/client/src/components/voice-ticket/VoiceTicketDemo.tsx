import React from 'react';
import { useVoiceTicketForm } from '../../hooks/useVoiceTicketForm';
import { VoiceVisualizer } from './VoiceVisualizer';
import { TranscriptView } from './TranscriptView';
import { DraftEditor } from './DraftEditor';
import { NudgePanel } from './NudgePanel';

export const VoiceTicketDemo: React.FC = () => {
  const form = useVoiceTicketForm();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Voice Ticket MVP</h1>
        <div className="flex gap-3">
          <button
            onClick={form.isRecording ? form.stopRecording : form.startRecording}
            disabled={!form.isSupported}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${form.isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white disabled:opacity-50`}
          >
            {form.isRecording ? '⏹ Stop & Process' : '🎤 Start Recording'}
          </button>
          <button onClick={form.resetTranscript} className="px-4 py-3 border rounded-xl">Reset</button>
        </div>
      </div>

      {!form.isSupported && <div className="p-4 bg-yellow-100 text-yellow-800 rounded">Browser does not support Web Speech API. Use Chrome/Edge.</div>}

      <VoiceVisualizer isListening={form.isListening} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TranscriptView 
          transcript={form.transcript} 
          isRecording={form.isRecording}
          liveText={form.isRecording ? form.transcript.slice(-1)[0]?.text : ''}
        />
        
        <DraftEditor
          draft={form.draft}
          isProcessing={form.isProcessing}
          onUpdate={form.updateDraft}
          onRegenerate={form.handleRegenerate}
          onConfirm={form.confirmTicket}
          isSubmitting={form.isSubmitting}
          submitError={form.submitError}
          confirmedTicketId={form.confirmedTicketId}
        />
      </div>

      {form.draft && form.draft.nudges.length > 0 && (
        <NudgePanel nudges={form.draft.nudges} onApply={form.applyNudge} />
      )}

      {form.error && <div className="text-red-600 p-3 bg-red-50 rounded">{form.error}</div>}
    </div>
  );
};
