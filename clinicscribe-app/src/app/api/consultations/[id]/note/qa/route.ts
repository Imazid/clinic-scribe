import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildQAFindings } from '@/lib/workflow/artifacts';
import { checkOrigin, forbidden } from '@/lib/apiSecurity';
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
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const body = (await request.json()) as QABody;

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
      await supabase
        .from('clinical_notes')
        .update({
          qa_findings: qaFindings,
          verification_status: verificationStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.noteId);
    }

    return NextResponse.json({
      qa_findings: qaFindings,
      verification_status: verificationStatus,
    });
  } catch (error) {
    console.error('QA generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate QA findings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
