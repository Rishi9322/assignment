import { useCallback, useState } from 'react';
import type { TicketDraft, VoiceTicketState } from '../types/voice-ticket';
import type { Priority } from '../types/ticket';
import { ticketService } from '../services/ticket.service';
import { useSpeechToText } from './useSpeechToText';
import { useTicketDraftExtraction } from './useTicketDraftExtraction';

const PRIORITY_MAP: Record<TicketDraft['priority'], Priority> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const useVoiceTicketForm = () => {
  const speech = useSpeechToText();
  const { extractDraft, isExtracting, regenerate } = useTicketDraftExtraction(speech.transcript);
  const [state, setState] = useState<VoiceTicketState>({
    isRecording: false,
    transcript: [],
    draft: null,
    isProcessing: false,
    error: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedTicketId, setConfirmedTicketId] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    speech.startListening();
    setState(prev => ({ ...prev, isRecording: true, error: null }));
  }, [speech]);

  const stopRecording = useCallback(async () => {
    speech.stopListening();
    setState(prev => ({ ...prev, isRecording: false, isProcessing: true }));
    
    if (speech.transcript.length > 0) {
      const draft = await extractDraft(speech.transcript);
      setState(prev => ({ ...prev, draft, isProcessing: false, transcript: speech.transcript }));
    } else {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [speech, extractDraft]);

  const updateDraft = useCallback((updates: Partial<TicketDraft>) => {
    setState(prev => ({
      ...prev,
      draft: prev.draft ? { ...prev.draft, ...updates } : null,
    }));
  }, []);

  const applyNudge = useCallback((nudgeId: string, value: string) => {
    setState(prev => {
      if (!prev.draft) return prev;
      const nudge = prev.draft.nudges.find(n => n.id === nudgeId);
      if (!nudge || !nudge.field) return prev;
      
      const newDraft = { ...prev.draft };
      if (nudge.field === 'customerEmail') newDraft.customerEmail = value;
      newDraft.nudges = newDraft.nudges.filter(n => n.id !== nudgeId);
      return { ...prev, draft: newDraft };
    });
  }, []);

  const highlightUncertainties = useCallback((text: string) => {
    // Simple highlight logic for demo
    return text;
  }, []);

  const handleRegenerate = useCallback(async () => {
    const newDraft = await regenerate();
    if (newDraft) setState(prev => ({ ...prev, draft: newDraft }));
  }, [regenerate]);

  const confirmTicket = useCallback(async () => {
    const draft = state.draft;
    if (!draft) return null;
    if (!draft.customerName?.trim() || !draft.customerEmail?.trim()) {
      setSubmitError('Add the customer\'s name and email before confirming.');
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await ticketService.create({
        customer_name: draft.customerName.trim(),
        customer_email: draft.customerEmail.trim(),
        subject: draft.title || 'Voice ticket',
        description: draft.description,
        priority: PRIORITY_MAP[draft.priority],
      });
      setConfirmedTicketId(result.ticket_id);
      return result;
    } catch (err: any) {
      setSubmitError(
        err?.response?.status === 401
          ? 'Sign in to save this ticket to the CRM.'
          : err?.response?.data?.error ?? 'Failed to create the ticket. Please try again.'
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [state.draft]);

  return {
    ...state,
    ...speech,
    startRecording,
    stopRecording,
    updateDraft,
    applyNudge,
    highlightUncertainties,
    handleRegenerate,
    confirmTicket,
    isSubmitting,
    submitError,
    confirmedTicketId,
    isProcessing: state.isProcessing || isExtracting,
  };
};
