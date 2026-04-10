'use client';

import { useEffect } from 'react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Pause, Play, RotateCcw, Radio, CheckCircle2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onRecordingReset?: () => void;
  disabled?: boolean;
  liveMode?: boolean;
  compact?: boolean;
}

export function AudioRecorder({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onRecordingReset,
  disabled,
  liveMode,
  compact,
}: AudioRecorderProps) {
  const { isRecording, isPaused, duration, audioBlob, audioUrl, waveformData, start, stop, pause, resume, reset } = useAudioRecorder();

  useEffect(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  async function handleStart() {
    await start();
    onRecordingStart?.();
  }

  function handleStop() {
    stop();
    onRecordingStop?.();
  }

  function handleReset() {
    onRecordingReset?.();
    reset();
  }

  const isIdle = !isRecording && !audioBlob;

  return (
    <div className="text-center space-y-5">
      {/* Live recording banner */}
      <AnimatePresence>
        {isRecording && liveMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-center gap-2"
          >
            <Badge variant="error" className="px-4 py-1.5">
              <span className="relative flex h-2.5 w-2.5 mr-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              Live Transcription Active
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waveform visualization */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.3 }}
            className={cn('flex items-center justify-center gap-[3px]', compact ? 'h-10' : 'h-16')}
          >
            {waveformData.map((v, i) => (
              <motion.div
                key={i}
                className={cn(
                  'w-1 rounded-full',
                  isPaused ? 'bg-on-surface-variant/30' : 'bg-error'
                )}
                animate={{ height: isPaused ? 4 : Math.max(4, Math.abs(v) * 64) }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration display */}
      <div className={cn(
        'font-mono font-bold transition-colors',
        isRecording && !isPaused
          ? cn(compact ? 'text-3xl' : 'text-5xl', 'text-error')
          : isRecording && isPaused
            ? cn(compact ? 'text-3xl' : 'text-5xl', 'text-on-surface-variant')
            : cn(compact ? 'text-2xl' : 'text-4xl', 'text-on-surface')
      )}>
        {formatDuration(duration)}
      </div>

      {/* Main record button — idle state */}
      <AnimatePresence mode="wait">
        {isIdle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={handleStart}
              disabled={disabled}
              className={cn(
                'group relative rounded-full flex items-center justify-center transition-all',
                compact ? 'w-16 h-16' : 'w-24 h-24',
                'bg-error text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
                'disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-lg'
              )}
            >
              <span className={cn(
                'absolute inset-0 rounded-full border-error/30 group-hover:border-error/50 transition-colors',
                compact ? 'border-2' : 'border-[3px]'
              )} />
              <Mic className={compact ? 'w-7 h-7' : 'w-9 h-9'} />
            </button>
            <p className="text-sm text-on-surface-variant">
              {disabled
                ? 'Select a patient first'
                : liveMode
                  ? 'Tap to start recording with live transcription'
                  : 'Tap to start recording'}
            </p>
          </motion.div>
        )}

        {/* Recording controls */}
        {isRecording && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-5"
          >
            <button
              onClick={isPaused ? resume : pause}
              className={cn(
                'rounded-full border-2 border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-low transition-colors',
                compact ? 'w-11 h-11' : 'w-14 h-14'
              )}
            >
              {isPaused ? <Play className={cn(compact ? 'w-4 h-4' : 'w-5 h-5', 'text-on-surface ml-0.5')} /> : <Pause className={cn(compact ? 'w-4 h-4' : 'w-5 h-5', 'text-on-surface')} />}
            </button>

            {/* Stop button with pulse ring */}
            <div className="relative">
              {!isPaused && (
                <>
                  <span className="absolute inset-0 rounded-full bg-error/20 animate-ping" />
                  <span className="absolute -inset-2 rounded-full border-2 border-error/20 animate-pulse" />
                </>
              )}
              <button
                onClick={handleStop}
                className={cn(
                  'relative rounded-full bg-error text-white flex items-center justify-center hover:bg-error/90 transition-colors shadow-lg',
                  compact ? 'w-14 h-14' : 'w-[72px] h-[72px]'
                )}
              >
                <Square className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
              </button>
            </div>

            <div className={compact ? 'w-11 h-11' : 'w-14 h-14'} />
          </motion.div>
        )}

        {/* Post-recording state */}
        {audioBlob && !isRecording && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-3"
          >
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" /> Re-record
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2.5 text-sm font-semibold text-success">
              <CheckCircle2 className="w-4 h-4" />
              Recording ready
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
