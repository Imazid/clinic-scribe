'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface TranscriptEntry {
  /** Timestamp like `00:42` or `01:14`. */
  timestamp?: string;
  /** Speaker label (Clinician / Patient / etc.). */
  speaker?: string;
  text: string;
  /** Set true on the entry currently being transcribed — renders the cursor. */
  live?: boolean;
}

interface LiveTranscriptPanelProps {
  entries: TranscriptEntry[];
  /** Auto-scroll to the bottom whenever a new entry arrives (default true). */
  autoScroll?: boolean;
  /** Optional empty-state placeholder copy. */
  emptyText?: string;
  className?: string;
}

function speakerTone(speaker: string | undefined): string {
  const s = (speaker ?? '').toLowerCase();
  if (s.includes('clinician') || s.includes('doctor') || s.includes('dr')) return 'text-secondary';
  if (s.includes('patient')) return 'text-tertiary';
  return 'text-outline';
}

/**
 * LiveTranscriptPanel — speaker-tagged rolling transcript with auto-scroll
 * and a blinking cursor on the live entry. Pure render: parent owns the
 * transcription state via useRealtimeTranscription / useTranscription hooks.
 */
export function LiveTranscriptPanel({
  entries,
  autoScroll = true,
  emptyText = 'Transcript will appear here once recording starts.',
  className,
}: LiveTranscriptPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll) return;
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [entries.length, autoScroll]);

  if (entries.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[420px] items-center justify-center text-center text-sm text-on-surface-variant',
          className,
        )}
      >
        <p className="max-w-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'scroll-area flex flex-col gap-3.5 overflow-y-auto px-7 py-6',
        className,
      )}
    >
      {entries.map((e, i) => {
        const isLast = i === entries.length - 1;
        return (
          <div
            key={`${e.timestamp ?? i}-${i}`}
            className={cn('flex gap-3', !isLast && 'opacity-85')}
          >
            <div className="w-14 shrink-0 pt-0.5 font-mono text-[11px] text-outline">
              {e.timestamp ?? ''}
            </div>
            <div className="min-w-0 flex-1">
              {e.speaker && (
                <div
                  className={cn(
                    'mb-0.5 text-[11px] font-bold uppercase tracking-[0.04em]',
                    speakerTone(e.speaker),
                  )}
                >
                  {e.speaker}
                </div>
              )}
              <div className="text-sm leading-[1.55] text-on-surface">
                {e.text}
                {e.live && (
                  <span className="ml-0.5 inline-block h-3.5 w-0.5 align-middle bg-secondary animate-pulse" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
