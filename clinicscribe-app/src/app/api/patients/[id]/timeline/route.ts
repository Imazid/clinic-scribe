import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildTimelineEvents } from '@/lib/workflow/artifacts';
import type { CareTask, Consultation, GeneratedDocument } from '@/lib/types';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, clinic_id')
      .eq('id', id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

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
    console.error('Patient timeline error:', error);
    const message = error instanceof Error ? error.message : 'Failed to load timeline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
