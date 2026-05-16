import { NextResponse } from 'next/server';
import { buildTimelineEvents } from '@/lib/workflow/artifacts';
import {
  logError,
  notFound,
  requireCallerClinic,
  requireUser,
} from '@/lib/apiSecurity';
import type { CareTask, Consultation, GeneratedDocument } from '@/lib/types';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;

  try {
    const { id } = await context.params;

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', id)
      .maybeSingle();

    if (patientError || !patient) return notFound('Patient not found');
    if (patient.clinic_id !== clinicId) return notFound('Patient not found');

    const [consultationsRes, tasksRes, documentsRes] = await Promise.all([
      supabase
        .from('consultations')
        .select('*, clinical_note:clinical_notes(*)')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('care_tasks')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('generated_documents')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false }),
    ]);

    const timeline = buildTimelineEvents({
      clinicId: patient.clinic_id,
      patientId: id,
      consultations: (consultationsRes.data || []) as Consultation[],
      careTasks: (tasksRes.data || []) as CareTask[],
      documents: (documentsRes.data || []) as GeneratedDocument[],
    });

    return NextResponse.json({ events: timeline });
  } catch (error) {
    logError('patient-timeline', error);
    return NextResponse.json(
      { error: 'Failed to load timeline' },
      { status: 500 }
    );
  }
}
