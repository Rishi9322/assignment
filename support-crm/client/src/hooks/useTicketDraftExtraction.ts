import { useState, useCallback } from 'react';
import type { TicketDraft, TranscriptSegment } from '../types/voice-ticket';

interface UseTicketDraftExtractionReturn {
  extractDraft: (transcript: TranscriptSegment[]) => Promise<TicketDraft>;
  isExtracting: boolean;
  regenerate: () => Promise<TicketDraft | null>;
}

const SIMULATED_API_DELAY = 800;

const simulateExtraction = async (text: string): Promise<TicketDraft> => {
  await new Promise(r => setTimeout(r, SIMULATED_API_DELAY));
  const lower = text.toLowerCase();
  const priority = lower.includes('urgent') || lower.includes('critical') ? 'urgent' : lower.includes('high') ? 'high' : 'medium';
  const category = lower.includes('billing') ? 'billing' : lower.includes('bug') ? 'bug' : 'feature';
  
  const uncertaintyFlags = [];
  if (!lower.includes('@')) uncertaintyFlags.push({ field: 'customerEmail', reason: 'No email detected', confidence: 0.4 });
  if (text.length < 50) uncertaintyFlags.push({ field: 'description', reason: 'Short transcript', confidence: 0.6 });

  return {
    title: text.split('.').slice(0, 1).join('').slice(0, 60) || 'Voice Ticket',
    description: text,
    priority,
    category,
    uncertaintyFlags,
    nudges: uncertaintyFlags.length > 0 ? [{ id: 'n1', message: 'Please confirm customer email', type: 'clarify', field: 'customerEmail' }] : [],
  };
};

export const useTicketDraftExtraction = (_transcript: TranscriptSegment[]): UseTicketDraftExtractionReturn => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  const extractDraft = useCallback(async (trans: TranscriptSegment[]) => {
    setIsExtracting(true);
    const fullText = trans.map(t => t.text).join(' ');
    setLastTranscript(fullText);
    const draft = await simulateExtraction(fullText);
    setIsExtracting(false);
    return draft;
  }, []);

  const regenerate = useCallback(async () => {
    if (!lastTranscript) return null;
    setIsExtracting(true);
    const draft = await simulateExtraction(lastTranscript);
    setIsExtracting(false);
    return draft;
  }, [lastTranscript]);

  return { extractDraft, isExtracting, regenerate };
};
