import React from 'react';
import type { TranscriptSegment } from '../../types/voice-ticket';

interface Props {
  transcript: TranscriptSegment[];
  isRecording: boolean;
  liveText?: string;
}

export const TranscriptView: React.FC<Props> = ({ transcript, isRecording, liveText }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 h-[420px] flex flex-col">
      <div className="flex justify-between mb-3">
        <div className="font-semibold">Live Transcript</div>
        {isRecording && <div className="text-red-500 flex items-center gap-1 text-sm"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Recording</div>}
      </div>
      <div className="flex-1 overflow-auto space-y-2 text-sm font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
        {transcript.length === 0 && !liveText && <div className="text-slate-400">Speak now... transcript will appear here.</div>}
        {transcript.map(seg => (
          <div key={seg.id} className={`p-2 rounded ${seg.isFinal ? 'bg-white dark:bg-slate-800' : 'opacity-70 italic'}`}>
            {seg.text} <span className="text-[10px] text-slate-400">({(seg.confidence * 100).toFixed(0)}%)</span>
          </div>
        ))}
        {liveText && <div className="text-blue-600 animate-pulse">{liveText}...</div>}
      </div>
    </div>
  );
};
