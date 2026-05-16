'use client';

import { useState, useRef, useCallback } from 'react';

export type TranscriptionEngine = 'on-device' | 'deepgram';

export interface LiveSegment {
  id: string;
  speaker: number;
  text: string;
  start: number;
  end: number;
  isFinal: boolean;
}

// ── Browser SpeechRecognition types ──

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return SR || null;
}

// ── Hook ──

export function useRealtimeTranscription() {
  const [isConnected, setIsConnected] = useState(false);
  const [segments, setSegments] = useState<LiveSegment[]>([]);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<TranscriptionEngine>('deepgram');

  // On-device refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStoppingRef = useRef(false);

  // Deepgram refs
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Shared refs
  const segmentIdRef = useRef(0);
  const startTimeRef = useRef(0);

  // ── On-device (Web Speech API) ──

  const connectOnDevice = useCallback(async () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setError('Speech recognition not supported in this browser. Use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass() as SpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-AU';
      recognition.maxAlternatives = 3;

      startTimeRef.current = Date.now();

      recognition.onstart = () => {
        console.log('[LiveTranscript] On-device speech recognition started');
        setIsConnected(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          // Pick the alternative with the highest confidence
          let bestText = '';
          let bestConfidence = 0;
          for (let j = 0; j < result.length; j++) {
            if (result[j].confidence > bestConfidence) {
              bestConfidence = result[j].confidence;
              bestText = result[j].transcript.trim();
            }
          }
          if (!bestText) continue;

          if (result.isFinal) {
            // Skip low-confidence segments (background noise / garbage)
            if (bestConfidence < 0.4) {
              console.log('[LiveTranscript] Skipped low-confidence segment:', bestText.slice(0, 40), bestConfidence.toFixed(2));
              continue;
            }
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const segment: LiveSegment = {
              id: `seg-${segmentIdRef.current++}`,
              speaker: 0,
              text: bestText,
              start: Math.max(0, elapsed - 3),
              end: elapsed,
              isFinal: true,
            };
            console.log('[LiveTranscript] Final:', bestText.slice(0, 60), `(${(bestConfidence * 100).toFixed(0)}%)`);
            setSegments((prev) => [...prev, segment]);
          } else {
            interim += bestText;
          }
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.error('[LiveTranscript] Error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        if (!isStoppingRef.current && recognitionRef.current) {
          // Small delay to prevent rapid restart loops
          setTimeout(() => {
            if (!isStoppingRef.current && recognitionRef.current) {
              try { recognition.start(); } catch { setIsConnected(false); }
            }
          }, 100);
        } else {
          setIsConnected(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start speech recognition');
    }
  }, []);

  const disconnectOnDevice = useCallback(() => {
    isStoppingRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    setIsConnected(false);
    setInterimText('');
  }, []);

  // ── Deepgram (cloud, with speaker diarization) ──

  const connectDeepgram = useCallback(async () => {
    try {
      console.log('[LiveTranscript] Fetching Deepgram token...');
      const tokenRes = await fetch('/api/deepgram-token');
      const tokenData = await tokenRes.json();

      if (tokenData.error || !tokenData.key) {
        setError(tokenData.error || 'Failed to get Deepgram token');
        return;
      }

      console.log('[LiveTranscript] Requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const params = new URLSearchParams({
        model: 'nova-2-medical',
        language: 'en-AU',
        punctuate: 'true',
        diarize: 'true',
        smart_format: 'true',
        interim_results: 'true',
        utterance_end_ms: '1500',
        vad_events: 'true',
        endpointing: '400',
        encoding: 'opus',
        sample_rate: '16000',
        keywords: 'patient:2,medication:2,diagnosis:2,prescription:2,symptoms:2,allergy:2',
      });

      const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, ['token', tokenData.key]);
      wsRef.current = ws;
      startTimeRef.current = Date.now();

      ws.onopen = () => {
        console.log('[LiveTranscript] Deepgram WebSocket connected');
        setIsConnected(true);

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';

        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Results') {
            const transcript = data.channel?.alternatives?.[0];
            if (!transcript?.transcript) return;
            const text = transcript.transcript.trim();
            if (!text) return;

            if (data.is_final) {
              const words = transcript.words || [];
              const speakerCounts: Record<number, number> = {};
              words.forEach((w: { speaker?: number }) => {
                const s = w.speaker ?? 0;
                speakerCounts[s] = (speakerCounts[s] || 0) + 1;
              });
              const dominantSpeaker = Object.entries(speakerCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '0';

              const segment: LiveSegment = {
                id: `seg-${segmentIdRef.current++}`,
                speaker: parseInt(dominantSpeaker),
                text,
                start: data.start || 0,
                end: (data.start || 0) + (data.duration || 0),
                isFinal: true,
              };
              console.log('[LiveTranscript] Deepgram final:', text.slice(0, 50));
              setSegments((prev) => [...prev, segment]);
              setInterimText('');
            } else {
              setInterimText(text);
            }
          }
        } catch (parseErr) {
          console.warn('[LiveTranscript] Parse error:', parseErr);
        }
      };

      ws.onerror = () => {
        console.warn('[LiveTranscript] Deepgram failed, falling back to on-device');
        // Clean up Deepgram resources inline
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        wsRef.current = null;
        setEngine('on-device');
        connectOnDevice();
      };
      ws.onclose = (event) => {
        setIsConnected(false);
        if (event.code !== 1000 && event.code !== 1005) {
          console.warn('[LiveTranscript] Deepgram closed unexpectedly, falling back to on-device');
          setEngine('on-device');
          connectOnDevice();
        }
      };
    } catch (err) {
      console.warn('[LiveTranscript] Deepgram init failed, falling back to on-device:', err);
      setEngine('on-device');
      connectOnDevice();
    }
  }, [connectOnDevice]);

  const disconnectDeepgram = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'CloseStream' }));
        wsRef.current.close(1000);
      }
      wsRef.current = null;
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsConnected(false);
    setInterimText('');
  }, []);

  // ── Public API ──

  const connect = useCallback(async () => {
    setError(null);
    setSegments([]);
    setInterimText('');
    segmentIdRef.current = 0;
    isStoppingRef.current = false;

    if (engine === 'deepgram') {
      await connectDeepgram();
    } else {
      await connectOnDevice();
    }
  }, [engine, connectDeepgram, connectOnDevice]);

  const disconnect = useCallback(() => {
    if (engine === 'deepgram') {
      disconnectDeepgram();
    } else {
      disconnectOnDevice();
    }
  }, [engine, disconnectDeepgram, disconnectOnDevice]);

  const getFullTranscript = useCallback(() => {
    // Deduplicate consecutive identical segments and clean up
    const deduped: string[] = [];
    for (const s of segments) {
      const text = s.text.trim();
      if (text && text !== deduped[deduped.length - 1]) {
        // Capitalize first letter of each segment
        deduped.push(text.charAt(0).toUpperCase() + text.slice(1));
      }
    }
    return deduped.join(' ').replace(/\s{2,}/g, ' ').trim();
  }, [segments]);

  const getSegmentsForStorage = useCallback(() => {
    return segments.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text,
      speaker: engine === 'deepgram'
        ? (s.speaker === 0 ? 'Clinician' : `Speaker ${s.speaker + 1}`)
        : null,
    }));
  }, [segments, engine]);

  const clearSegments = useCallback(() => {
    setSegments([]);
    setInterimText('');
    segmentIdRef.current = 0;
  }, []);

  return {
    isConnected,
    segments,
    interimText,
    error,
    engine,
    setEngine,
    connect,
    disconnect,
    getFullTranscript,
    getSegmentsForStorage,
    clearSegments,
  };
}
