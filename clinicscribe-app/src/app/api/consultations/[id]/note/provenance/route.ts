import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildProvenanceMap } from '@/lib/workflow/artifacts';
import type {
  ClinicalNote,
  ConfidenceScores,
  MedicationDraft,
  FollowUpTask,
  Patient,
  SOAPNote,
  Transcript,
} from '@/lib/types';

interface ProvenanceBody {
  noteId?: string;
  content: SOAPNote;
  confidence_scores: ConfidenceScores;
  medications?: MedicationDraft[];
  follow_up_tasks?: FollowUpTask[];
  referrals?: string[];
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = (await request.json()) as ProvenanceBody;

    const { data: consultation, error } = await supabase
      .from('consultations')
      .select('patient:patients(*), transcript:transcripts(*)')
      .eq('id', id)
      .single();

    if (error || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const typedConsultation = consultation as unknown as {
      patient: Patient | null;
      transcript: Transcript[] | null;
    };
    const transcript = typedConsultation.transcript?.[0]?.full_text || '';
    const patient = typedConsultation.patient;

    const provenance = buildProvenanceMap({
      note: {
        content: body.content,
        confidence_scores: body.confidence_scores,
      } as Pick<ClinicalNote, 'content' | 'confidence_scores'>,
      transcript,
      patient,
    });

    if (body.noteId) {
      await supabase
        .from('clinical_notes')
        .update({
          provenance_map: provenance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.noteId);
    }

    return NextResponse.json({ provenance_map: provenance });
  } catch (error) {
    console.error('Provenance generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate provenance';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
