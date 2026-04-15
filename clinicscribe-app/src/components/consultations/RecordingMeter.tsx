'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Pause, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';

interface RecordingMeterProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  waveformData: number[];
  inputLevel: number;
  onPauseResume?: () => void;
  onStop?: () => void;
  className?: string;
}

const VU_SEGMENTS = 12;

export function RecordingMeter({
  isRecording,
  isPaused,
  duration,
  waveformData,
  inputLevel,
  onPauseResume,
  onStop,
  className,
}: RecordingMeterProps) {
  // Noise-only detection — sustained very-low level for >1s
  const lowSinceRef = useRef<number | null>(null);
  const [noiseOnly, setNoiseOnly] = useState(false);

  useEffect(() => {
    if (!isRecording || isPaused) {
      lowSinceRef.current = null;
      setNoiseOnly(false);
      return;
    }
    if (inputLevel < 0.04) {
      if (lowSinceRef.current === null) lowSinceRef.current = Date.now();
      else if (Date.now() - lowSinceRef.current > 1000) setNoiseOnly(true);
    } else {
      lowSinceRef.current = null;
      setNoiseOnly(false);
    }
  }, [inputLevel, isRecording, isPaused]);

  const clipping = inputLevel > 0.85;
  const waveformColor = isPaused
    ? 'bg-on-surface-variant/25'
    : clipping
    ? 'bg-error'
    : 'bg-primary';

  // 32 bars — pad or slice waveform data accordingly
  const bars = waveformData.slice(0, 32);
  while (bars.length < 32) bars.push(0);

  return (
    <div
      className={cn(
        'flex items-stretch gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 shadow-sm',
        className
      )}
    >
      {/* Stopwatch */}
      <div className="flex items-center gap-3 pr-4 border-r border-outline-variant/40">
        <span className="relative flex h-3 w-3">
          {isRecording && !isPaused && (
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-error/60"
              animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <span
            className={cn(
              'relative inline-flex h-3 w-3 rounded-full',
              isRecording && !isPaused ? 'bg-error' : 'bg-on-surface-variant/50'
            )}
          />
        </span>
        <div className="flex flex-col">
          <span className="font-mono text-2xl font-semibold leading-none text-on-surface tabular-nums">
            {formatDuration(duration)}
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
            {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Session time'}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex h-12 items-center gap-[2px]">
          {bars.map((v, i) => (
            <div
              key={i}
              className={cn('w-[3px] rounded-full transition-colors', waveformColor)}
              style={{ height: `${Math.max(4, Math.abs(v) * 48)}px` }}
            />
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            {noiseOnly ? (
              <span className="text-warning">Noise only — speak closer to the mic</span>
            ) : clipping ? (
              <span className="text-error">Clipping — back off slightly</span>
            ) : (
              <span>Input level</span>
            )}
          </span>
          <span className="tabular-nums">{Math.round(inputLevel * 100)}%</span>
        </div>
      </div>

      {/* VU meter */}
      <div className="flex items-stretch gap-2 border-l border-outline-variant/40 pl-4">
        <div className="flex h-full flex-col-reverse gap-[3px]">
          {Array.from({ length: VU_SEGMENTS }).map((_, i) => {
            const threshold = (i + 1) / VU_SEGMENTS;
            const filled = inputLevel >= threshold - 0.02;
            // colour by position: bottom green → mid amber → top red
            const color =
              i < VU_SEGMENTS * 0.6
                ? 'bg-primary'
                : i < VU_SEGMENTS * 0.85
                ? 'bg-warning'
                : 'bg-error';
            return (
              <div
                key={i}
                className={cn(
                  'h-1.5 w-4 rounded-sm transition-all duration-75',
                  filled ? color : 'bg-outline-variant/30'
                )}
              />
            );
          })}
        </div>

        {/* Controls */}
        {(onPauseResume || onStop) && isRecording && (
          <div className="flex flex-col justify-center gap-2 pl-2">
            {onPauseResume && (
              <button
                type="button"
                onClick={onPauseResume}
                aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 bg-surface text-on-surface hover:bg-surface-container-high"
              >
                {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
            {onStop && (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop recording"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-error text-white hover:bg-error/90"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
