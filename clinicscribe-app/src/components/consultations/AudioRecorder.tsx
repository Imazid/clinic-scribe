'use client';

import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDuration } from '@/lib/utils';
import { Mic, Square, Pause, Play, RotateCcw, Radio } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  disabled?: boolean;
  liveMode?: boolean;
}

export function AudioRecorder({ onRecordingComplete, onRecordingStart, onRecordingStop, disabled, liveMode }: AudioRecorderProps) {
  const { isRecording, isPaused, duration, audioBlob, audioUrl, waveformData, start, stop, pause, resume, reset } = useAudioRecorder();

  async function handleStart() {
    await start();
    onRecordingStart?.();
  }

  function handleStop() {
    stop();
    onRecordingStop?.();
  }

  function handleUseRecording() {
    if (audioBlob) onRecordingComplete(audioBlob);
  }

  function handleReset() {
    reset();
  }

  return (
    <Card className="text-center">
      {/* Live indicator */}
      {isRecording && liveMode && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="error">
            <Radio className="w-3 h-3 animate-pulse" /> Live Transcription Active
          </Badge>
        </div>
      )}

      {/* Waveform visualization */}
      {isRecording && (
        <div className="flex items-center justify-center gap-0.5 h-16 mb-4">
          {waveformData.map((v, i) => (
            <div
              key={i}
              className="w-1 bg-secondary rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, Math.abs(v) * 60)}px` }}
            />
          ))}
        </div>
      )}

      {/* Duration display */}
      <div className="text-4xl font-mono font-bold text-on-surface mb-6">
        {formatDuration(duration)}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={handleStart}
            disabled={disabled}
            className="w-20 h-20 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-ambient"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <>
            <Button variant="outline" size="lg" onClick={isPaused ? resume : pause}>
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <button
              onClick={handleStop}
              className="w-16 h-16 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/90 transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          </>
        )}

        {audioBlob && (
          <>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" /> Re-record
            </Button>
            <Button onClick={handleUseRecording}>Use Recording</Button>
          </>
        )}
      </div>

      {/* Audio preview */}
      {audioUrl && (
        <div className="mt-6">
          <audio controls src={audioUrl} className="w-full max-w-md mx-auto" />
        </div>
      )}

      {!isRecording && !audioBlob && (
        <p className="text-sm text-on-surface-variant mt-4">
          {liveMode
            ? 'Click the microphone to start recording with live transcription.'
            : 'Click the microphone to start recording the consultation.'}
        </p>
      )}
    </Card>
  );
}
