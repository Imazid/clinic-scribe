'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { AudioRecorder } from '@/components/consultations/AudioRecorder';
import { AudioUploader } from '@/components/consultations/AudioUploader';
import { LiveTranscript } from '@/components/consultations/LiveTranscript';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useRealtimeTranscription } from '@/lib/hooks/useRealtimeTranscription';
import type { TranscriptionEngine } from '@/lib/hooks/useRealtimeTranscription';
import { useTranscription } from '@/lib/hooks/useTranscription';
import { createConsultation, updateConsultationStatus } from '@/lib/api/consultations';
import { uploadAudio } from '@/lib/api/audio';
import { CONSULTATION_TYPE_OPTIONS } from '@/lib/constants';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { getPatients } from '@/lib/api/patients';
import type { Patient } from '@/lib/types';
import { Mic, Cloud } from 'lucide-react';

export default function NewConsultationPage() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const addToast = useUIStore((s) => s.addToast);
  const { isTranscribing, progress, transcribe } = useTranscription();

  const [mode, setMode] = useState('record');
  const [consultationType, setConsultationType] = useState('Standard Consultation');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hasLiveTranscript, setHasLiveTranscript] = useState(false);

  // Live transcription
  const realtime = useRealtimeTranscription();

  async function searchPatients(query: string) {
    setPatientSearch(query);
    if (!query || !profile?.clinic_id) { setPatientResults([]); return; }
    try {
      const results = await getPatients(profile.clinic_id, query);
      setPatientResults(results);
    } catch { /* ignore */ }
  }

  function handleAudioReady(blob: Blob) {
    setAudioBlob(blob);
  }

  const handleRecordingStart = useCallback(() => {
    realtime.connect();
  }, [realtime.connect]);

  const handleRecordingStop = useCallback(() => {
    realtime.disconnect();
    setHasLiveTranscript(true);
  }, [realtime.disconnect]);

  function handleEngineChange(newEngine: TranscriptionEngine) {
    if (realtime.isConnected) return; // Can't switch while recording
    realtime.setEngine(newEngine);
    realtime.clearSegments();
  }

  async function handleSubmit() {
    if (!profile?.clinic_id || !profile?.id || !selectedPatient || !audioBlob) {
      addToast('Please select a patient and provide audio', 'error');
      return;
    }

    setProcessing(true);
    try {
      const consultation = await createConsultation(
        profile.clinic_id, profile.id, selectedPatient.id, consultationType
      );

      const fileName = `recording-${Date.now()}.webm`;
      await uploadAudio(profile.clinic_id, consultation.id, audioBlob, fileName);

      // Use live transcript if available, otherwise fall back to Whisper
      let transcriptText: string;
      let transcriptSegments: Array<{ start: number; end: number; text: string; speaker?: string | null }>;

      if (hasLiveTranscript && realtime.segments.length > 0) {
        transcriptText = realtime.getFullTranscript();
        transcriptSegments = realtime.getSegmentsForStorage();
      } else {
        await updateConsultationStatus(consultation.id, 'transcribing');
        const result = await transcribe(consultation.id, audioBlob);
        transcriptText = result.text;
        transcriptSegments = result.segments;
      }

      // Save transcript to DB
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('transcripts').insert({
        consultation_id: consultation.id,
        full_text: transcriptText,
        segments: transcriptSegments,
        language: 'en',
        model: hasLiveTranscript
          ? (realtime.engine === 'deepgram' ? 'deepgram-nova-2-medical' : 'web-speech-api')
          : 'whisper-1',
      });

      await updateConsultationStatus(consultation.id, 'generating');
      addToast('Transcription complete. Generating note...', 'success');
      router.push(`/consultations/${consultation.id}/review`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to process consultation', 'error');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <BreadcrumbNav items={[{ label: 'Consultations', href: '/consultations' }, { label: 'New Consultation' }]} />
      <PageHeader title="New Consultation" className="mt-4" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Controls */}
        <div className="space-y-6">
          {/* Patient selection */}
          <Card>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Patient</h3>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/5">
                <div>
                  <p className="text-sm font-medium text-on-surface">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                  <p className="text-xs text-on-surface-variant">MRN: {selectedPatient.mrn || 'N/A'}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>Change</Button>
              </div>
            ) : (
              <div>
                <SearchInput placeholder="Search patients..." value={patientSearch} onSearch={searchPatients} onChange={(e) => searchPatients(e.target.value)} />
                {patientResults.length > 0 && (
                  <div className="mt-2 border border-outline-variant rounded-xl overflow-hidden">
                    {patientResults.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setPatientResults([]); setPatientSearch(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors text-sm border-b border-outline-variant/30 last:border-0"
                      >
                        <span className="font-medium text-on-surface">{p.first_name} {p.last_name}</span>
                        {p.mrn && <span className="text-on-surface-variant ml-2">MRN: {p.mrn}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Consultation type */}
          <Card>
            <Select
              id="type"
              label="Consultation Type"
              options={CONSULTATION_TYPE_OPTIONS.map((t) => ({ label: t, value: t }))}
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
            />
          </Card>

          {/* Transcription engine toggle */}
          <Card>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Live Transcription Mode
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleEngineChange('on-device')}
                disabled={realtime.isConnected}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  realtime.engine === 'on-device'
                    ? 'border-secondary bg-secondary/5'
                    : 'border-outline-variant/30 hover:border-outline-variant'
                } ${realtime.isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Mic className={`w-6 h-6 ${realtime.engine === 'on-device' ? 'text-secondary' : 'text-on-surface-variant'}`} />
                <span className={`text-sm font-semibold ${realtime.engine === 'on-device' ? 'text-secondary' : 'text-on-surface'}`}>
                  On-Device
                </span>
                <span className="text-xs text-on-surface-variant text-center">
                  Free, private, no API key needed
                </span>
              </button>
              <button
                onClick={() => handleEngineChange('deepgram')}
                disabled={realtime.isConnected}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  realtime.engine === 'deepgram'
                    ? 'border-secondary bg-secondary/5'
                    : 'border-outline-variant/30 hover:border-outline-variant'
                } ${realtime.isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Cloud className={`w-6 h-6 ${realtime.engine === 'deepgram' ? 'text-secondary' : 'text-on-surface-variant'}`} />
                <span className={`text-sm font-semibold ${realtime.engine === 'deepgram' ? 'text-secondary' : 'text-on-surface'}`}>
                  Cloud (Deepgram)
                </span>
                <span className="text-xs text-on-surface-variant text-center">
                  Medical vocabulary, speaker labels
                </span>
              </button>
            </div>
          </Card>

          {/* Audio capture */}
          <div>
            <Tabs
              tabs={[{ label: 'Record (Live)', value: 'record' }, { label: 'Upload File', value: 'upload' }]}
              defaultValue="record"
              onChange={setMode}
              className="mb-4"
            />
            {mode === 'record' ? (
              <AudioRecorder
                onRecordingComplete={handleAudioReady}
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
                disabled={!selectedPatient}
                liveMode
              />
            ) : (
              <AudioUploader onFileSelected={handleAudioReady} />
            )}
          </div>

          {/* Progress */}
          {(isTranscribing || processing) && (
            <Card>
              <p className="text-sm text-on-surface-variant mb-2">
                {isTranscribing ? 'Transcribing audio...' : 'Processing...'}
              </p>
              <ProgressBar value={progress} />
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedPatient || !audioBlob || processing}
              isLoading={processing}
            >
              Process Consultation
            </Button>
          </div>
        </div>

        {/* Right column: Live Transcript */}
        <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
          <LiveTranscript
            segments={realtime.segments}
            interimText={realtime.interimText}
            isConnected={realtime.isConnected}
            engine={realtime.engine}
          />
          {realtime.error && (
            <div className="mt-3 p-3 rounded-lg bg-error/10 text-error text-sm">
              {realtime.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
