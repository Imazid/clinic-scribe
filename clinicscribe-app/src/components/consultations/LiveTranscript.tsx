'use client';

import { useEffect, useRef } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';
import type { LiveSegment, TranscriptionEngine } from '@/lib/hooks/useRealtimeTranscription';
import { Info, Radio } from 'lucide-react';

interface LiveTranscriptProps {
  segments: LiveSegment[];
  interimText: string;
  isConnected: boolean;
  engine: TranscriptionEngine;
}

interface SpeakerStyle {
  pill: string;
  border: string;
  dot: string;
  label: string;
}

const speakerStyles: SpeakerStyle[] = [
  {
    pill: 'bg-secondary text-on-secondary',
    border: 'border-l-secondary',
    dot: 'bg-secondary',
    label: 'Clinician',
  },
  {
    pill: 'bg-primary text-on-primary',
    border: 'border-l-primary',
    dot: 'bg-primary',
    label: 'Patient',
  },
  {
    pill: 'bg-warning text-white',
    border: 'border-l-warning',
    dot: 'bg-warning',
    label: 'Other',
  },
];

function getSpeakerStyle(speaker: number, engine: TranscriptionEngine): SpeakerStyle {
  if (engine === 'on-device') {
    return {
      pill: 'bg-secondary/15 text-secondary',
      border: 'border-l-secondary/40',
      dot: 'bg-secondary',
      label: 'Transcript',
    };
  }
  return speakerStyles[speaker] || speakerStyles[2];
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

      {engine === 'deepgram' ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-surface-container-lowest px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">
            Speakers:
          </span>
          {speakerStyles.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs text-on-surface">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface-variant">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Switch to Deepgram to see speaker roles (clinician vs patient). On-device transcription
            cannot distinguish speakers.
          </span>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2">
        {segments.length === 0 && !interimText && (
          <div className="text-center py-12 text-sm text-on-surface-variant">
            {isConnected
              ? 'Listening... Start speaking to see the transcript appear.'
              : 'Click "Start Recording" to begin live transcription.'}
          </div>
        )}

        {segments.map((seg) => {
          const style = getSpeakerStyle(seg.speaker, engine);
          return (
            <div
              key={seg.id}
              className={`flex gap-3 animate-fade-in rounded-r-md border-l-4 ${style.border} bg-surface-container-lowest/60 py-1.5 pl-3 pr-2`}
            >
              <span className="text-xs text-outline font-mono shrink-0 pt-2 w-12">
                {formatDuration(Math.floor(seg.start))}
              </span>
              <div className="flex-1">
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mb-1 ${style.pill}`}>
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
