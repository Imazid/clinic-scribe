'use client';

import { Bookmark, Pause, Play, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingControlsProps {
  /** Recording is currently in flight (audio chunks streaming). */
  recording: boolean;
  /** Elapsed seconds since session start. */
  elapsedSec: number;
  /** Toggle pause / resume. */
  onTogglePause: () => void;
  /** Stop recording and proceed to drafting the note. */
  onStop: () => void;
  /** Discard the current session (parent should confirm before calling). */
  onDiscard?: () => void;
  /** Drop a bookmark / timestamp marker into the transcript. */
  onBookmark?: () => void;
  /** Disable everything (used while a state transition is in flight). */
  busy?: boolean;
}

function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * RecordingControls — floating bottom-center pill with the live mic indicator,
 * timer, audio-level visualisation, pause/resume, bookmark, stop-and-draft,
 * and discard. Renders fixed-position; safe to mount once.
 */
export function RecordingControls({
  recording,
  elapsedSec,
  onTogglePause,
  onStop,
  onDiscard,
  onBookmark,
  busy = false,
}: RecordingControlsProps) {
  return (
    <div
      role="region"
      aria-label="Recording controls"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3.5 rounded-full bg-primary px-4 py-2.5 pl-5 text-on-primary shadow-ambient-lg"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'inline-block h-2.5 w-2.5 rounded-full',
            recording ? 'bg-error pulse-ring' : 'bg-outline',
          )}
        />
        <span className="min-w-[56px] font-mono text-sm font-bold tracking-tight tabular-nums">
          {formatElapsed(elapsedSec)}
        </span>
        <span className="hidden h-[22px] items-center sm:flex" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'wave-bar',
                !recording && 'opacity-30',
              )}
              style={{
                animationDelay: `${i * 0.07}s`,
                height: `${10 + (i % 3) * 4}px`,
                background: '#fff',
              }}
            />
          ))}
        </span>
      </div>

      <span className="h-6 w-px bg-on-primary/20" aria-hidden="true" />

      <button
        type="button"
        onClick={onTogglePause}
        disabled={busy}
        aria-label={recording ? 'Pause recording' : 'Resume recording'}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full text-white shadow-ambient-sm transition-all hover:-translate-y-px disabled:opacity-50',
          recording ? 'bg-error' : 'bg-tertiary',
        )}
      >
        {recording ? <Pause className="h-[18px] w-[18px]" /> : <Play className="h-[18px] w-[18px]" />}
      </button>

      {onBookmark && (
        <button
          type="button"
          onClick={onBookmark}
          disabled={busy}
          aria-label="Add timestamp marker"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-on-primary/10 text-on-primary transition-colors hover:bg-on-primary/15 disabled:opacity-50"
        >
          <Bookmark className="h-[15px] w-[15px]" />
        </button>
      )}

      <span className="h-6 w-px bg-on-primary/20" aria-hidden="true" />

      <button
        type="button"
        onClick={onStop}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-on-primary px-4 text-sm font-semibold text-primary shadow-ambient-sm transition-all hover:-translate-y-px hover:shadow-ambient disabled:opacity-50"
      >
        <Square className="h-3.5 w-3.5 fill-current" /> Stop &amp; draft note
      </button>

      {onDiscard && (
        <button
          type="button"
          onClick={onDiscard}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-on-primary/70 transition-colors hover:bg-on-primary/10 hover:text-on-primary disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" /> Discard
        </button>
      )}
    </div>
  );
}
