'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  Cloud,
  Ear,
  FileAudio,
  LayoutTemplate,
  Loader2,
  Mic,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { WorkflowStepper } from '@/components/ui/WorkflowStepper';

import { AudioUploader } from '@/components/consultations/AudioUploader';
import { ConsultationTypeSelect } from '@/components/consultations/ConsultationTypeSelect';
import { TemplatePickerDialog } from '@/components/templates/TemplatePickerDialog';
import { PatientSearchCombobox } from '@/components/patients/PatientSearchCombobox';

import { PatientContextPanel } from '@/components/capture/PatientContextPanel';
import {
  LiveTranscriptPanel,
  type TranscriptEntry,
} from '@/components/capture/LiveTranscriptPanel';
import { RecordingControls } from '@/components/capture/RecordingControls';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useRealtimeTranscription } from '@/lib/hooks/useRealtimeTranscription';
import type { TranscriptionEngine } from '@/lib/hooks/useRealtimeTranscription';
import { useTranscription } from '@/lib/hooks/useTranscription';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useAudioDevice } from '@/lib/hooks/useAudioDevice';
import { useWorkspaceTemplates } from '@/lib/hooks/useWorkspaceTemplates';
import { createConsultation, updateConsultationStatus } from '@/lib/api/consultations';
import { uploadAudio } from '@/lib/api/audio';
import type { Patient } from '@/lib/types';
import { DEFAULT_TEMPLATE_KEY } from '@/lib/templates/catalog';
import { cn } from '@/lib/utils';

function formatTimestampSeconds(s: number): string {
  const safe = Math.max(0, Math.floor(s));
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function speakerLabel(idx: number | undefined): string {
  if (idx === 0 || idx === undefined) return 'Clinician';
  return 'Patient';
}

export default function NewConsultationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const addToast = useUIStore((s) => s.addToast);
  const { isTranscribing, progress, transcribe } = useTranscription();
  const { templates, defaultTemplate, resolveByKey } = useWorkspaceTemplates();

  // Session config
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [consultationType, setConsultationType] = useState('Standard Consultation');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(DEFAULT_TEMPLATE_KEY);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const selectedTemplate = resolveByKey(selectedTemplateKey);

  // Audio + transcription
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioSource, setAudioSource] = useState<'record' | 'upload' | null>(null);
  const [audioLabel, setAudioLabel] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const realtime = useRealtimeTranscription();
  const recorder = useAudioRecorder();
  const audioDevice = useAudioDevice();
  const hasLiveTranscript = realtime.segments.length > 0;
  const canCreateReview =
    Boolean(selectedPatient && audioBlob) && !processing && !realtime.isConnected;

  const detectFromStream = audioDevice.detectFromStream;
  useEffect(() => {
    if (recorder.activeStream) {
      detectFromStream(recorder.activeStream);
    }
  }, [recorder.activeStream, detectFromStream]);

  useEffect(() => {
    if (
      defaultTemplate &&
      selectedTemplateKey === DEFAULT_TEMPLATE_KEY &&
      defaultTemplate.key !== DEFAULT_TEMPLATE_KEY
    ) {
      setSelectedTemplateKey(defaultTemplate.key);
    }
  }, [defaultTemplate, selectedTemplateKey]);

  useEffect(() => {
    if (recorder.audioBlob) {
      setAudioBlob(recorder.audioBlob);
      setAudioSource('record');
      setAudioLabel('Live recording ready');
    }
  }, [recorder.audioBlob]);

  const clearPreparedAudio = useCallback(() => {
    setAudioBlob(null);
    setAudioSource(null);
    setAudioLabel(null);
  }, []);

  const handleUploadedAudioReady = useCallback(
    (file: File) => {
      setAudioBlob(file);
      setAudioSource('upload');
      setAudioLabel(file.name);
      realtime.clearSegments();
    },
    [realtime],
  );

  const handleStartRecording = useCallback(async () => {
    clearPreparedAudio();
    realtime.clearSegments();
    await recorder.start();
    realtime.connect();
  }, [clearPreparedAudio, realtime, recorder]);

  const handleStopRecording = useCallback(() => {
    recorder.stop();
    realtime.disconnect();
  }, [recorder, realtime]);

  const handlePauseResume = useCallback(() => {
    if (recorder.isPaused) recorder.resume();
    else recorder.pause();
  }, [recorder]);

  const handleReset = useCallback(() => {
    clearPreparedAudio();
    realtime.clearSegments();
    recorder.reset();
  }, [clearPreparedAudio, realtime, recorder]);

  const handleEngineChange = useCallback(
    (newEngine: TranscriptionEngine) => {
      if (realtime.isConnected) return;
      realtime.setEngine(newEngine);
      realtime.clearSegments();
    },
    [realtime],
  );

  async function handleSubmit() {
    if (!profile?.clinic_id || !profile?.id || !selectedPatient || !audioBlob) {
      addToast('Please select a patient and provide audio', 'error');
      return;
    }
    if (realtime.isConnected) {
      addToast('Stop the live recording before creating the review draft', 'error');
      return;
    }

    setProcessing(true);
    try {
      const consultation = await createConsultation(
        profile.clinic_id,
        profile.id,
        selectedPatient.id,
        consultationType,
        selectedTemplate.key,
      );

      const fileName =
        audioSource === 'upload'
          ? audioLabel || `upload-${Date.now()}.webm`
          : `recording-${Date.now()}.webm`;
      await uploadAudio(profile.clinic_id, consultation.id, audioBlob, fileName);

      let transcriptText: string;
      let transcriptSegments: Array<{
        start: number;
        end: number;
        text: string;
        speaker?: string | null;
      }>;

      if (hasLiveTranscript) {
        transcriptText = realtime.getFullTranscript();
        transcriptSegments = realtime.getSegmentsForStorage();
      } else {
        await updateConsultationStatus(consultation.id, 'transcribing');
        const result = await transcribe(consultation.id, audioBlob);
        transcriptText = result.text;
        transcriptSegments = result.segments;
      }

      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('transcripts').insert({
        consultation_id: consultation.id,
        full_text: transcriptText,
        segments: transcriptSegments,
        language: 'en',
        model: hasLiveTranscript
          ? realtime.engine === 'deepgram'
            ? 'deepgram-nova-2-medical'
            : 'web-speech-api'
          : 'whisper-1',
      });

      await updateConsultationStatus(consultation.id, 'generating');
      addToast('Transcription complete. Opening review workspace.', 'success');
      router.push(`/consultations/${consultation.id}/review?template=${selectedTemplate.key}`);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to process consultation',
        'error',
      );
    } finally {
      setProcessing(false);
    }
  }

  // Adapt realtime segments + interim text into the design's TranscriptEntry shape.
  const transcriptEntries = useMemo<TranscriptEntry[]>(() => {
    const entries: TranscriptEntry[] = realtime.segments.map((s) => ({
      timestamp: formatTimestampSeconds(s.start),
      speaker: speakerLabel(s.speaker),
      text: s.text,
    }));
    if (realtime.interimText) {
      entries.push({
        timestamp: formatTimestampSeconds(recorder.duration),
        speaker: 'Clinician',
        text: realtime.interimText,
        live: true,
      });
    }
    return entries;
  }, [realtime.segments, realtime.interimText, recorder.duration]);

  const consultationMode =
    consultationType.toLowerCase().includes('telehealth') ? 'Telehealth' : 'In-clinic';

  const isLive = recorder.isRecording || hasLiveTranscript;
  const showFloatingControls = recorder.isRecording;

  return (
    <div className="space-y-5 pb-32">
      {/* Stepper + session meta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WorkflowStepper active="capture" />
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1.5 text-[11px]">
            <LayoutTemplate className="h-3 w-3" /> {selectedTemplate.name}
          </Badge>
          <Badge variant="default" className="gap-1.5 text-[11px]">
            <Building2 className="h-3 w-3" /> {consultationMode}
          </Badge>
        </div>
      </div>

      {/* Session config row */}
      <Card variant="default" className="flex flex-wrap items-center gap-3 p-3">
        {selectedPatient ? (
          <div className="flex items-center gap-1.5 rounded-full bg-secondary/10 py-1 pl-3 pr-1">
            <span className="text-sm font-semibold text-secondary">
              {selectedPatient.first_name} {selectedPatient.last_name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              aria-label="Clear patient"
              className="rounded-full p-1 text-secondary transition-colors hover:bg-secondary/20"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <PatientSearchCombobox
            clinicId={profile?.clinic_id}
            onSelect={setSelectedPatient}
          />
        )}

        <div className="h-5 w-px bg-outline-variant/60" />

        <button
          type="button"
          onClick={() => setTemplatePickerOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 text-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <span className="font-medium">{selectedTemplate.name}</span>
          <span className="text-xs text-on-surface-variant">▾</span>
        </button>

        <ConsultationTypeSelect value={consultationType} onChange={setConsultationType} />

        <div className="h-5 w-px bg-outline-variant/60" />

        <div className="flex items-center gap-2">
          {realtime.engine === 'deepgram' ? (
            <Cloud className="h-3.5 w-3.5 text-secondary" />
          ) : (
            <Mic className="h-3.5 w-3.5 text-secondary" />
          )}
          <span className="text-xs text-on-surface-variant">
            {realtime.engine === 'deepgram' ? 'Cloud' : 'On-device'}
          </span>
          <Toggle
            checked={realtime.engine === 'deepgram'}
            onChange={(checked) => handleEngineChange(checked ? 'deepgram' : 'on-device')}
            disabled={realtime.isConnected}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {audioDevice.device && (
            <Badge variant="default" className="gap-1.5 text-[11px]">
              <Mic className="h-3 w-3" />
              {audioDevice.device.shortLabel}
            </Badge>
          )}

          {audioBlob && !recorder.isRecording && audioSource === 'record' && (
            <>
              <Badge variant="success" className="gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" /> Recorded
              </Badge>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-on-surface-variant transition-colors hover:text-on-surface"
              >
                <RotateCcw className="h-3 w-3" /> Redo
              </button>
            </>
          )}

          {audioBlob && audioSource === 'upload' && (
            <Badge variant="success" className="gap-1 text-[11px]">
              <FileAudio className="h-3 w-3" /> {audioLabel ?? 'Uploaded'}
            </Badge>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!canCreateReview}
            isLoading={processing}
            size="md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Create review draft
          </Button>
        </div>
      </Card>

      {/* Two-column body */}
      <div
        className={cn(
          'grid gap-5',
          selectedPatient ? 'lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]' : 'lg:grid-cols-1',
        )}
      >
        {/* LEFT: patient context (visible only when a patient is selected) */}
        {selectedPatient && (
          <Card variant="default" className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="eyebrow">Patient context</div>
            </div>
            <PatientContextPanel patient={selectedPatient} />
          </Card>
        )}

        {/* RIGHT: transcript / mode card */}
        <Card variant="default" className="p-0 overflow-hidden">
          {/* Transcript header (consent + audio info) */}
          <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant/60 bg-surface-container-low px-5 py-3.5">
            {selectedPatient ? (
              <Badge variant="success" className="gap-1.5 text-[11px]">
                <ShieldCheck className="h-3 w-3" /> Consent recorded
              </Badge>
            ) : (
              <Badge variant="default" className="gap-1.5 text-[11px]">
                <ShieldCheck className="h-3 w-3" /> Consent gate
              </Badge>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Ear className="h-3.5 w-3.5 text-tertiary" />
              <span>Audio · 64 kbps · 44.1 kHz</span>
            </div>
          </div>

          {/* Mode tabs (only when truly idle) */}
          {!isLive && !audioBlob && (
            <div className="flex items-center gap-1 px-5 pt-4">
              {(['record', 'upload'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    if (m === 'upload') {
                      if (realtime.isConnected) {
                        addToast('Stop recording first', 'error');
                        return;
                      }
                      clearPreparedAudio();
                      realtime.clearSegments();
                    }
                    setMode(m);
                  }}
                  className={cn(
                    'relative z-10 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                    mode === m
                      ? 'text-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-high',
                  )}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="capture-mode-indicator"
                      className="absolute inset-0 rounded-full bg-secondary/10"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative">{m === 'record' ? 'Record' : 'Upload'}</span>
                </button>
              ))}
            </div>
          )}

          {/* Body — idle / live / done states */}
          <div className="min-h-[460px]">
            <AnimatePresence mode="wait">
              {/* IDLE — record */}
              {!isLive && !audioBlob && mode === 'record' && (
                <motion.div
                  key="idle-record"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex min-h-[460px] flex-col items-center justify-center px-6 py-10"
                >
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={!selectedPatient}
                    className={cn(
                      'group relative flex h-20 w-20 items-center justify-center rounded-full bg-error text-white shadow-ambient-lg transition-all',
                      'hover:scale-105 hover:shadow-ambient-lg active:scale-95',
                      'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100',
                    )}
                  >
                    <span className="absolute inset-0 rounded-full border-2 border-error/30 transition-colors group-hover:border-error/50" />
                    <Mic className="h-8 w-8" />
                  </button>
                  <p className="mt-4 text-sm font-semibold text-on-surface">
                    {selectedPatient ? 'Start recording' : 'Select a patient to begin'}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Live transcript will appear here during the session.
                  </p>
                </motion.div>
              )}

              {/* IDLE — upload */}
              {!isLive && !audioBlob && mode === 'upload' && (
                <motion.div
                  key="idle-upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex min-h-[460px] items-center justify-center px-6 py-10"
                >
                  <div className="w-full max-w-md">
                    <AudioUploader onFileSelected={handleUploadedAudioReady} />
                  </div>
                </motion.div>
              )}

              {/* LIVE — recording / transcript */}
              {isLive && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <LiveTranscriptPanel entries={transcriptEntries} />
                </motion.div>
              )}

              {/* POST — audio ready */}
              {audioBlob && !isLive && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex min-h-[460px] flex-col items-center justify-center px-6 text-center"
                >
                  {audioSource === 'upload' ? (
                    <>
                      <Upload className="h-10 w-10 text-secondary/40" />
                      <p className="mt-3 text-sm font-semibold text-on-surface">
                        Audio file staged
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Create the review draft to transcribe and continue.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-success/60" />
                      <p className="mt-3 text-sm font-semibold text-on-surface">
                        Recording complete
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Create the review draft to generate the clinical note.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Inline error */}
          {realtime.error && (
            <div className="mx-5 mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {realtime.error}
            </div>
          )}

          {/* Processing footer */}
          {(isTranscribing || processing) && (
            <div className="flex items-center gap-3 border-t border-outline-variant/60 px-5 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              <p className="text-sm text-on-surface-variant">
                {isTranscribing ? 'Transcribing…' : 'Processing…'}
              </p>
              <ProgressBar value={progress} className="w-40" />
            </div>
          )}
        </Card>
      </div>

      {/* Floating recording controls */}
      {showFloatingControls && (
        <RecordingControls
          recording={!recorder.isPaused}
          elapsedSec={recorder.duration}
          onTogglePause={handlePauseResume}
          onStop={handleStopRecording}
          onDiscard={handleReset}
        />
      )}

      <TemplatePickerDialog
        open={templatePickerOpen}
        templates={templates}
        selectedKey={selectedTemplate.key}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={(template) => {
          setSelectedTemplateKey(template.key);
          setTemplatePickerOpen(false);
        }}
      />
    </div>
  );
}
