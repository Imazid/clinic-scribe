import { NextResponse } from 'next/server';
import {
  buildGeneratedDocuments,
  buildPatientSummary,
  materializeCareTasks,
} from '@/lib/workflow/artifacts';
import type { ClinicalNote, Consultation, Patient } from '@/lib/types';
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

const missingWorkflowSchemaCodes = new Set(['PGRST200', 'PGRST205']);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;
  if (!(await rateLimit(`closeout-materialize:${user.id}`, 20, 60_000))) return tooMany();

  try {
    const { id } = await context.params;
    const { noteId } = (await request.json()) as { noteId?: string };

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    const { data: consultation, error } = await supabase
      .from('consultations')
      .select('*, patient:patients(*), clinical_note:clinical_notes(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !consultation) return notFound('Consultation not found');
    if (consultation.clinic_id !== clinicId) return notFound('Consultation not found');

    const typedConsultation = consultation as unknown as Consultation & {
      patient: Patient | null;
      clinical_note: ClinicalNote[] | ClinicalNote | null;
    };
    const rawNote = typedConsultation.clinical_note;
    const note = noteId
      ? (Array.isArray(rawNote) ? rawNote.find((item) => item.id === noteId) : rawNote)
      : Array.isArray(rawNote)
        ? rawNote[rawNote.length - 1]
        : rawNote;

    if (!typedConsultation.patient || !note) {
      return NextResponse.json({ error: 'Closeout requires a patient and generated note' }, { status: 400 });
    }

    const patientSummary = buildPatientSummary({
      patient: typedConsultation.patient,
      note,
    });

    const tasks = materializeCareTasks({
      clinicId: typedConsultation.clinic_id,
      patientId: typedConsultation.patient_id,
      consultationId: id,
      noteId: note.id,
      ownerUserId: typedConsultation.clinician_id,
      planText: note.content.plan,
      followUpTasks: note.follow_up_tasks,
      referrals: note.referrals,
    });

    const documents = buildGeneratedDocuments({
      clinicId: typedConsultation.clinic_id,
      patientId: typedConsultation.patient_id,
      consultationId: id,
      noteId: note.id,
      note,
      patientSummary,
    });

    let workflowPersistenceAvailable = true;
    const deleteTasksResult = await supabase.from('care_tasks').delete().eq('consultation_id', id).eq('note_id', note.id);
    const deleteDocumentsResult = await supabase.from('generated_documents').delete().eq('consultation_id', id).eq('note_id', note.id);

    if (
      (deleteTasksResult.error && missingWorkflowSchemaCodes.has(deleteTasksResult.error.code)) ||
      (deleteDocumentsResult.error && missingWorkflowSchemaCodes.has(deleteDocumentsResult.error.code))
    ) {
      workflowPersistenceAvailable = false;
    }

    if (workflowPersistenceAvailable && tasks.length > 0) {
      const { error: taskError } = await supabase.from('care_tasks').insert(tasks);
      if (taskError) {
        if (missingWorkflowSchemaCodes.has(taskError.code)) {
          workflowPersistenceAvailable = false;
        } else {
          throw taskError;
        }
      }
    }

    if (workflowPersistenceAvailable && documents.length > 0) {
      const { error: documentError } = await supabase.from('generated_documents').insert(documents);
      if (documentError) {
        if (missingWorkflowSchemaCodes.has(documentError.code)) {
          workflowPersistenceAvailable = false;
        } else {
          throw documentError;
        }
      }
    }

    await supabase
      .from('clinical_notes')
      .update({
        patient_summary_snapshot: patientSummary,
        verification_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', note.id);

    const statusUpdate = await supabase
      .from('consultations')
      .update({
        status: workflowPersistenceAvailable ? 'closeout_pending' : 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (statusUpdate.error && workflowPersistenceAvailable) {
      await supabase
        .from('consultations')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    return NextResponse.json({
      patient_summary: patientSummary,
      task_count: workflowPersistenceAvailable ? tasks.length : 0,
      document_count: workflowPersistenceAvailable ? documents.length : 0,
    });
  } catch (error) {
    logError('closeout-materialize', error);
    return NextResponse.json(
      { error: 'Failed to materialize closeout artifacts' },
      { status: 500 }
    );
  }
}
