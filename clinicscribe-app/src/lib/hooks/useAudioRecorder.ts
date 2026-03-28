'use client';

import { useState, useRef, useCallback } from 'react';
import { AUDIO_CONSTRAINTS } from '@/lib/constants';

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  waveformData: number[];
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false, isPaused: false, duration: 0, audioBlob: null, audioUrl: null, waveformData: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(data);
    const samples = Array.from(data.slice(0, 64)).map((v) => (v - 128) / 128);
    setState((s) => ({ ...s, waveformData: samples }));
    animFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: AUDIO_CONSTRAINTS.sampleRate, channelCount: AUDIO_CONSTRAINTS.channels },
    });
    streamRef.current = stream;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(AUDIO_CONSTRAINTS.mimeType)
        ? AUDIO_CONSTRAINTS.mimeType
        : 'audio/webm',
      audioBitsPerSecond: AUDIO_CONSTRAINTS.bitRate,
    });

    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      setState((s) => ({ ...s, audioBlob: blob, audioUrl: url, isRecording: false, isPaused: false }));
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;

    setState((s) => ({ ...s, isRecording: true, isPaused: false, duration: 0, audioBlob: null, audioUrl: null }));

    timerRef.current = setInterval(() => {
      setState((s) => ({ ...s, duration: s.duration + 1 }));
    }, 1000);

    updateWaveform();
  }, [updateWaveform]);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setState((s) => ({ ...s, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setState((s) => ({ ...s, duration: s.duration + 1 }));
      }, 1000);
      setState((s) => ({ ...s, isPaused: false }));
    }
  }, []);

  const reset = useCallback(() => {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    setState({ isRecording: false, isPaused: false, duration: 0, audioBlob: null, audioUrl: null, waveformData: [] });
  }, [state.audioUrl]);

  return { ...state, start, stop, pause, resume, reset };
}
