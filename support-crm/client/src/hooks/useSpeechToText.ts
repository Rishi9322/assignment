import { useState, useRef, useCallback } from 'react';
import type { TranscriptSegment } from '../types/voice-ticket';

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

interface UseSpeechToTextReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: TranscriptSegment[];
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechToText = (): UseSpeechToTextReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const segmentIdRef = useRef(0);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    if (isListening) return;

    const recognition = createRecognition();
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const newSegments: TranscriptSegment[] = [];

      results.forEach((result) => {
        const transcriptText = result[0].transcript.trim();
        if (!transcriptText) return;

        const confidence = result[0].confidence || 0.9;
        const isFinal = result.isFinal;

        newSegments.push({
          id: `seg-${segmentIdRef.current++}`,
          text: transcriptText,
          timestamp: Date.now(),
          confidence,
          isFinal,
        });
      });

      setTranscript(prev => {
        const filteredPrev = prev.filter(p => p.isFinal);
        return [...filteredPrev, ...newSegments.filter(n => !filteredPrev.some(p => p.text === n.text))];
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      setError(null);
    } catch {
      setError('Failed to start recognition');
    }
  }, [isSupported, isListening, createRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript([]);
    segmentIdRef.current = 0;
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  };
};
