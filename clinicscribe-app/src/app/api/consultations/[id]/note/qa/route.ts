import { NextResponse } from 'next/server';
import { buildQAFindings } from '@/lib/workflow/artifacts';
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
  FollowUpTask,
  MedicationDraft,
  NoteProvenanceItem,
  Patient,
  SOAPNote,
  Transcript,
} from '@/lib/types';

interface QABody {
  noteId?: string;
  content: SOAPNote;
  confidence_scores: ConfidenceScores;
  medications: MedicationDraft[];
  follow_up_tasks: FollowUpTask[];
  provenance_map: NoteProvenanceItem[];
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;
  if (!(await rateLimit(`note-qa:${user.id}`, 30, 60_000))) return tooMany();

  try {
    const { id } = await context.params;

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    const body = (await request.json()) as QABody;

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
    const patient = typedConsultation.patient;
    const transcript = typedConsultation.transcript?.[0]?.full_text || '';
    let latestApprovedNote: Pick<ClinicalNote, 'medications'> | null = null;

    if (patient) {
      const { data: priorConsultations } = await supabase
        .from('consultations')
        .select('clinical_note:clinical_notes(*)')
        .eq('patient_id', patient.id)
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      latestApprovedNote =
        ((priorConsultations || [])
          .flatMap((item) => {
            const rawNotes = (item as { clinical_note?: ClinicalNote[] | ClinicalNote | null })
              .clinical_note;
            const notes = Array.isArray(rawNotes)
              ? rawNotes
              : rawNotes
                ? [rawNotes]
                : [];

            return notes.filter((note) => note.is_approved);
          })
          .sort(
            (left, right) =>
              new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
          )[0] as Pick<ClinicalNote, 'medications'> | undefined) ?? null;
    }

    const qaFindings = buildQAFindings({
      note: {
        content: body.content,
        confidence_scores: body.confidence_scores,
        medications: body.medications,
        follow_up_tasks: body.follow_up_tasks,
        provenance_map: body.provenance_map,
      } as Pick<
        ClinicalNote,
        'content' | 'confidence_scores' | 'medications' | 'follow_up_tasks' | 'provenance_map'
      >,
      patient,
      transcript,
      latestApprovedNote,
    });

    const verificationStatus = qaFindings.some((finding) => finding.severity === 'critical')
      ? 'qa_flagged'
      : 'ready';

    if (body.noteId) {
      // Verify the noteId belongs to this consultation before mutating it
      // — without this an authenticated caller could feed any noteId in
      // their clinic and stomp on its qa_findings.
      const { data: noteOwnership } = await supabase
        .from('clinical_notes')
        .select('id, consultation_id')
        .eq('id', body.noteId)
        .maybeSingle();

      if (noteOwnership && noteOwnership.consultation_id === id) {
        await supabase
          .from('clinical_notes')
          .update({
            qa_findings: qaFindings,
            verification_status: verificationStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.noteId);
      }
    }

    return NextResponse.json({
      qa_findings: qaFindings,
      verification_status: verificationStatus,
    });
  } catch (error) {
    logError('note-qa', error);
    return NextResponse.json(
      { error: 'Failed to generate QA findings' },
      { status: 500 }
    );
  }
}
