import { VoiceTicketDemo } from '../components/voice-ticket/VoiceTicketDemo';

export const VoiceTicketPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8">
      <VoiceTicketDemo />
      <div className="max-w-4xl mx-auto px-6 mt-8 text-xs text-slate-500">
        Web Speech API transcription • keyword-based draft extraction (not AI) • editable draft • confirm creates a real ticket via the same API as the New Ticket form. Requires a Chromium-based browser and an account to confirm.
      </div>
    </div>
  );
};
