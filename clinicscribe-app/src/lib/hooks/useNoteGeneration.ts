'use client';

import { useState, useCallback } from 'react';
import { generateNote } from '@/lib/api/note-generation';
import type {
  SOAPNote,
  ConfidenceScores,
  MedicationDraft,
  FollowUpTask,
  TemplateCatalogItem,
} from '@/lib/types';

interface NoteGenerationResult {
  content: SOAPNote;
  confidence_scores: ConfidenceScores;
  medications: MedicationDraft[];
  follow_up_tasks: FollowUpTask[];
  referrals: string[];
  template_key: string | null;
  ai_model: string;
  ai_prompt_version: string;
}

export function useNoteGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NoteGenerationResult | null>(null);

  const generate = useCallback(async (
    consultationId: string,
    transcript: string,
    patientContext?: string,
    templateKey?: string | null,
    template?: TemplateCatalogItem | null
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await generateNote(
        consultationId,
        transcript,
        patientContext,
        templateKey,
        template
      );
      setResult(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Note generation failed';
      setError(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, error, result, generate };
}
