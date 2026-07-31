export interface TicketDraft {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  customerName?: string;
  customerEmail?: string;
  uncertaintyFlags: Array<{
    field: string;
    reason: string;
    confidence: number;
  }>;
  nudges: Array<{
    id: string;
    message: string;
    type: 'clarify' | 'suggest' | 'confirm';
    field?: string;
  }>;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceTicketState {
  isRecording: boolean;
  transcript: TranscriptSegment[];
  draft: TicketDraft | null;
  isProcessing: boolean;
  error: string | null;
}
