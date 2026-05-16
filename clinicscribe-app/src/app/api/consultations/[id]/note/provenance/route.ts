import { NextResponse } from 'next/server';
import { buildProvenanceMap } from '@/lib/workflow/artifacts';
import {
  checkOrigin,
  forbidden,
  logError,
  notFound,
  rateLimit,
  requireCallerClinic,
  requireUser,
  tooMany,
} from '@/lib/apiSecurity';
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
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;
  if (!(await rateLimit(`note-provenance:${user.id}`, 30, 60_000))) return tooMany();

  try {
    const { id } = await context.params;

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    const body = (await request.json()) as ProvenanceBody;

    const { data: consultation, error } = await supabase
      .from('consultations')
      .select('clinic_id, patient:patients(*), transcript:transcripts(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !consultation) return notFound('Consultation not found');
    if (consultation.clinic_id !== clinicId) return notFound('Consultation not found');

    const typedConsultation = consultation as unknown as {
      clinic_id: string;
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
      const { data: noteOwnership } = await supabase
        .from('clinical_notes')
        .select('id, consultation_id')
        .eq('id', body.noteId)
        .maybeSingle();

      if (noteOwnership && noteOwnership.consultation_id === id) {
        await supabase
          .from('clinical_notes')
          .update({
            provenance_map: provenance,
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.noteId);
      }
    }

    return NextResponse.json({ provenance_map: provenance });
  } catch (error) {
    logError('note-provenance', error);
    return NextResponse.json(
      { error: 'Failed to generate provenance' },
      { status: 500 }
    );
  }
}
