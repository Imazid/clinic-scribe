'use client';

import { useState, useCallback } from 'react';
import { transcribeAudio } from '@/lib/api/transcription';
import { updateConsultationStatus } from '@/lib/api/consultations';

export function useTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (consultationId: string, audioBlob: Blob) => {
    setIsTranscribing(true);
    setProgress(10);
    setError(null);

    try {
      await updateConsultationStatus(consultationId, 'transcribing');
      setProgress(30);

      const result = await transcribeAudio(consultationId, audioBlob);
      setProgress(100);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return { isTranscribing, progress, error, transcribe };
}
