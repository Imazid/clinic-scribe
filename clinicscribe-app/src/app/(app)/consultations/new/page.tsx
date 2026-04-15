'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LiveTranscript } from '@/components/consultations/LiveTranscript';
import { RecordingMeter } from '@/components/consultations/RecordingMeter';
import { PatientContextCard } from '@/components/consultations/PatientContextCard';
import { AudioUploader } from '@/components/consultations/AudioUploader';
import { ConsultationTypeSelect } from '@/components/consultations/ConsultationTypeSelect';
import { TemplatePickerDialog } from '@/components/templates/TemplatePickerDialog';
import { PatientSearchCombobox } from '@/components/patients/PatientSearchCombobox';
import { ScribeWorkspaceShell } from '@/components/scribe/ScribeWorkspaceShell';
import { SessionRail } from '@/components/scribe/SessionRail';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useRealtimeTranscription } from '@/lib/hooks/useRealtimeTranscription';
import type { TranscriptionEngine } from '@/lib/hooks/useRealtimeTranscription';
import { useTranscription } from '@/lib/hooks/useTranscription';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useAudioDevice } from '@/lib/hooks/useAudioDevice';
import { createConsultation, updateConsultationStatus } from '@/lib/api/consultations';
import { uploadAudio } from '@/lib/api/audio';
import type { Patient } from '@/lib/types';
import { DEFAULT_TEMPLATE_KEY } from '@/lib/templates/catalog';
import { useWorkspaceTemplates } from '@/lib/hooks/useWorkspaceTemplates';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Cloud,
  Sparkles,
  Upload,
  Loader2,
  RotateCcw,
  CheckCircle2,
  FileAudio,
} from 'lucide-react';

export default function NewConsultationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const addToast = useUIStore((s) => s.addToast);
  const { isTranscribing, progress, transcribe } = useTranscription();
  const { templates, defaultTemplate, resolveByKey } = useWorkspaceTemplates();

  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [consultationType, setConsultationType] = useState('Standard Consultation');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(DEFAULT_TEMPLATE_KEY);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioSource, setAudioSource] = useState<'record' | 'upload' | null>(null);
  const [audioLabel, setAudioLabel] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const selectedTemplate = resolveByKey(selectedTemplateKey);

  const realtime = useRealtimeTranscription();
  const recorder = useAudioRecorder();
  const audioDevice = useAudioDevice();
  const hasLiveTranscript = realtime.segments.length > 0;
  const canCreateReview = Boolean(selectedPatient && audioBlob) && !processing && !realtime.isConnected;

  // Detect audio device when stream becomes available
  useEffect(() => {
    if (recorder.activeStream) {
      audioDevice.detectFromStream(recorder.activeStream);
    }
  }, [recorder.activeStream, audioDevice.detectFromStream]);

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

  function handleUploadedAudioReady(file: File) {
    setAudioBlob(file);
    setAudioSource('upload');
    setAudioLabel(file.name);
    realtime.clearSegments();
  }

  async function handleStartRecording() {
    clearPreparedAudio();
    realtime.clearSegments();
    await recorder.start();
    realtime.connect();
  }

  function handleStopRecording() {
    recorder.stop();
    realtime.disconnect();
  }

  function handlePauseResume() {
    if (recorder.isPaused) {
      recorder.resume();
    } else {
      recorder.pause();
    }
  }

  function handleReset() {
    clearPreparedAudio();
    realtime.clearSegments();
    recorder.reset();
  }

  function handleEngineChange(newEngine: TranscriptionEngine) {
    if (realtime.isConnected) return;
    realtime.setEngine(newEngine);
    realtime.clearSegments();
  }

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
        selectedTemplate.key
      );

      const fileName =
        audioSource === 'upload'
          ? audioLabel || `upload-${Date.now()}.webm`
          : `recording-${Date.now()}.webm`;
      await uploadAudio(profile.clinic_id, consultation.id, audioBlob, fileName);

      let transcriptText: string;
      let transcriptSegments: Array<{ start: number; end: number; text: string; speaker?: string | null }>;

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
      addToast(err instanceof Error ? err.message : 'Failed to process consultation', 'error');
    } finally {
      setProcessing(false);
    }
  }

  const heroTitle = selectedPatient
    ? `Capture • ${selectedPatient.first_name} ${selectedPatient.last_name}`
    : 'Capture';
  const heroDescription = selectedPatient
    ? 'Session ready. Start recording or upload audio for this patient.'
    : 'Record, transcribe, and hand off to review.';

  return (
    <ScribeWorkspaceShell
      title={heroTitle}
      description={heroDescription}
      rail={<SessionRail />}
      metaBar={
        <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
          {/* Patient */}
          {selectedPatient ? (
            <div className="flex items-center gap-2 rounded-full bg-secondary/8 pl-3 pr-1 py-1">
              <span className="text-sm font-medium text-on-surface">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </span>
              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-full px-2 py-0.5 text-xs text-secondary hover:bg-secondary/10"
              >
                &times;
              </button>
            </div>
          ) : (
            <PatientSearchCombobox
              clinicId={profile?.clinic_id}
              onSelect={setSelectedPatient}
            />
          )}

          <div className="h-4 w-px bg-outline-variant/30" />

          {/* Template */}
          <button
            onClick={() => setTemplatePickerOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="font-medium">{selectedTemplate.name}</span>
            <span className="text-on-surface-variant text-xs">&#9662;</span>
          </button>

          {/* Type */}
          <ConsultationTypeSelect
            value={consultationType}
            onChange={setConsultationType}
          />

          <div className="h-4 w-px bg-outline-variant/30" />

          {/* Engine toggle */}
          <div className="flex items-center gap-1.5">
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* Audio device indicator */}
          {audioDevice.device && (
            <div className="flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1">
              {audioDevice.device.type === 'bluetooth' ? (
                <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 7 10 10-5 5V2l5 5L7 17" />
                </svg>
              ) : audioDevice.device.type === 'usb' ? (
                <Mic className="w-3.5 h-3.5 text-secondary" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-on-surface-variant" />
              )}
              <span className="text-[11px] font-medium text-on-surface-variant">
                {audioDevice.device.shortLabel}
              </span>
            </div>
          )}

          {/* Recording indicator (when recording) — compact timer in meta bar;
              full meter is rendered in the workspace below */}
          {recorder.isRecording && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
              </span>
              <span className="font-mono text-sm font-semibold text-error tabular-nums">
                {formatDuration(recorder.duration)}
              </span>
            </div>
          )}

          {/* Post-recording controls */}
          {audioBlob && !recorder.isRecording && audioSource === 'record' && (
            <div className="flex items-center gap-2">
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Recorded
              </Badge>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface"
              >
                <RotateCcw className="w-3 h-3" /> Redo
              </button>
            </div>
          )}

          {/* Upload indicator */}
          {audioBlob && audioSource === 'upload' && (
            <Badge variant="success">
              <FileAudio className="w-3 h-3 mr-1" />
              {audioLabel || 'Uploaded'}
            </Badge>
          )}

          {/* Create review button */}
          <Button
            onClick={handleSubmit}
            disabled={!canCreateReview}
            isLoading={processing}
            size="sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Create review draft
          </Button>
        </div>
      }
      workspace={
        <div className="relative flex flex-col min-h-[560px]">
          {/* Patient context — visible whenever a patient is chosen */}
          <AnimatePresence initial={false}>
            {selectedPatient && (
              <motion.div
                key="patient-context"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-5 pt-5">
                  <PatientContextCard
                    patient={selectedPatient}
                    clinicId={profile?.clinic_id}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode toggle for upload */}
          {!recorder.isRecording && !hasLiveTranscript && !audioBlob && (
            <div className="flex items-center gap-1 px-5 pt-4">
              {(['record', 'upload'] as const).map((m) => (
                <button
                  key={m}
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
                    'relative px-3 py-1 rounded-full text-xs font-medium transition-colors z-10',
                    mode === m ? 'text-secondary' : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="mode-indicator"
                      className="absolute inset-0 rounded-full bg-secondary/10"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative">{m === 'record' ? 'Record' : 'Upload'}</span>
                </button>
              ))}
            </div>
          )}

          {/* Main workspace area */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {/* IDLE: Centered mic or upload zone */}
              {!recorder.isRecording && !hasLiveTranscript && !audioBlob && mode === 'record' && (
                <motion.div
                  key="idle-record"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center px-6"
                >
                  <button
                    onClick={handleStartRecording}
                    disabled={!selectedPatient}
                    className={cn(
                      'group relative w-20 h-20 rounded-full flex items-center justify-center transition-all',
                      'bg-error text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
                      'disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-lg'
                    )}
                  >
                    <span className="absolute inset-0 rounded-full border-2 border-error/30 group-hover:border-error/50 transition-colors" />
                    <Mic className="w-8 h-8" />
                  </button>
                  <p className="mt-4 text-sm font-medium text-on-surface">
                    {selectedPatient ? 'Start recording' : 'Select a patient to begin'}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Live transcript will appear here during the session
                  </p>
                </motion.div>
              )}

              {/* IDLE: Upload zone */}
              {!recorder.isRecording && !hasLiveTranscript && !audioBlob && mode === 'upload' && (
                <motion.div
                  key="idle-upload"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex items-center justify-center px-6 py-8"
                >
                  <div className="w-full max-w-md">
                    <AudioUploader onFileSelected={handleUploadedAudioReady} />
                  </div>
                </motion.div>
              )}

              {/* RECORDING / LIVE TRANSCRIPT */}
              {(recorder.isRecording || hasLiveTranscript) && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex-1 p-5 space-y-4"
                >
                  {recorder.isRecording && (
                    <RecordingMeter
                      isRecording={recorder.isRecording}
                      isPaused={recorder.isPaused}
                      duration={recorder.duration}
                      waveformData={recorder.waveformData}
                      inputLevel={recorder.inputLevel}
                      onPauseResume={handlePauseResume}
                      onStop={handleStopRecording}
                    />
                  )}
                  <LiveTranscript
                    segments={realtime.segments}
                    interimText={realtime.interimText}
                    isConnected={realtime.isConnected}
                    engine={realtime.engine}
                  />
                </motion.div>
              )}

              {/* POST-RECORDING: transcript ready */}
              {audioBlob && !recorder.isRecording && !hasLiveTranscript && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex-1 flex flex-col items-center justify-center px-6 text-center"
                >
                  {audioSource === 'upload' ? (
                    <>
                      <Upload className="h-10 w-10 text-secondary/40" />
                      <p className="mt-3 text-sm font-semibold text-on-surface">Audio file staged</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Create the review draft to transcribe and continue.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-success/60" />
                      <p className="mt-3 text-sm font-semibold text-on-surface">Recording complete</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Create the review draft to generate the clinical note.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error banner */}
          {realtime.error && (
            <div className="mx-5 mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              {realtime.error}
            </div>
          )}
        </div>
      }
      footer={
        (isTranscribing || processing) ? (
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-secondary" />
            <p className="text-sm text-on-surface-variant">
              {isTranscribing ? 'Transcribing...' : 'Processing...'}
            </p>
            <ProgressBar value={progress} className="w-40" />
          </div>
        ) : undefined
      }
    >
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
    </ScribeWorkspaceShell>
  );
}
