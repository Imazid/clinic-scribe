'use client';

import { useEffect, useRef } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';
import type { LiveSegment, TranscriptionEngine } from '@/lib/hooks/useRealtimeTranscription';
import { Radio } from 'lucide-react';

interface LiveTranscriptProps {
  segments: LiveSegment[];
  interimText: string;
  isConnected: boolean;
  engine: TranscriptionEngine;
}

const speakerColors = [
  { bg: 'bg-secondary/10', text: 'text-secondary', label: 'Clinician' },
  { bg: 'bg-primary/10', text: 'text-primary', label: 'Patient' },
  { bg: 'bg-warning/10', text: 'text-warning', label: 'Speaker 3' },
];

function getSpeakerLabel(speaker: number, engine: TranscriptionEngine) {
  if (engine === 'on-device') {
    return { bg: 'bg-secondary/10', text: 'text-secondary', label: 'Transcript' };
  }
  return speakerColors[speaker] || speakerColors[0];
}

export function LiveTranscript({ segments, interimText, isConnected, engine }: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, interimText]);

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Live Transcript</CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Badge variant="error">
              <Radio className="w-3 h-3 animate-pulse" /> Live
            </Badge>
          )}
          <Badge variant="default">
            {engine === 'deepgram' ? 'Cloud (Deepgram)' : 'On-Device'}
          </Badge>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2">
        {segments.length === 0 && !interimText && (
          <div className="text-center py-12 text-sm text-on-surface-variant">
            {isConnected
              ? 'Listening... Start speaking to see the transcript appear.'
              : 'Click "Start Recording" to begin live transcription.'}
          </div>
        )}

        {segments.map((seg) => {
          const style = getSpeakerLabel(seg.speaker, engine);
          return (
            <div key={seg.id} className="flex gap-3 animate-fade-in">
              <span className="text-xs text-outline font-mono shrink-0 pt-2 w-12">
                {formatDuration(Math.floor(seg.start))}
              </span>
              <div className="flex-1">
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md mb-1 ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
                <p className="text-sm text-on-surface leading-relaxed">{seg.text}</p>
              </div>
            </div>
          );
        })}

        {interimText && (
          <div className="flex gap-3 opacity-60">
            <span className="text-xs text-outline font-mono shrink-0 pt-2 w-12">...</span>
            <div className="flex-1">
              <p className="text-sm text-on-surface-variant italic leading-relaxed">{interimText}</p>
            </div>
          </div>
        )}
      </div>

      {segments.length > 0 && (
        <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>{segments.length} segments</span>
          {engine === 'deepgram' ? (
            <span>{segments.filter((s) => s.speaker === 0).length} clinician / {segments.filter((s) => s.speaker === 1).length} patient</span>
          ) : (
            <span>On-device transcription</span>
          )}
        </div>
      )}
    </Card>
  );
}
