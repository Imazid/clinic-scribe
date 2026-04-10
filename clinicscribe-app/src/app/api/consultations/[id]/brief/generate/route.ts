import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildVisitBriefArtifact } from '@/lib/workflow/artifacts';
import type { CareTask, ClinicalNote, Consultation } from '@/lib/types';

const missingWorkflowSchemaCodes = new Set(['PGRST200', 'PGRST205']);
const missingBriefOwnershipCodes = new Set(['42703', 'PGRST204']);

type ConsultationRow = Consultation & {
  patient: Consultation['patient'];
  clinical_note: ClinicalNote[] | ClinicalNote | null;
};

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*, patient:patients(*), clinical_note:clinical_notes(*)')
      .eq('id', id)
      .single();

    if (consultationError || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const typedConsultation = consultation as unknown as ConsultationRow;
    if (!typedConsultation.patient) {
      return NextResponse.json({ error: 'Consultation patient context is missing' }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let currentProfileId: string | null = null;
    if (user?.id) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      currentProfileId = currentProfile?.id ?? null;
    }

    const { data: priorConsultations } = await supabase
      .from('consultations')
      .select('*, clinical_note:clinical_notes(*)')
      .eq('patient_id', typedConsultation.patient_id)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: openTasks } = await supabase
      .from('care_tasks')
      .select('*')
      .eq('patient_id', typedConsultation.patient_id)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false });

    const brief = buildVisitBriefArtifact({
      consultation: typedConsultation,
      patient: typedConsultation.patient,
      priorConsultations: (priorConsultations || []) as Consultation[],
      openTasks: (openTasks || []) as CareTask[],
    });

    const existingBriefQuery = await supabase
      .from('visit_briefs')
      .select('id, created_by')
      .eq('consultation_id', id)
      .maybeSingle();

    const existingBrief = missingBriefOwnershipCodes.has(
      existingBriefQuery.error?.code || ''
    )
      ? null
      : existingBriefQuery.data;

    const payload = {
      clinic_id: typedConsultation.clinic_id,
      patient_id: typedConsultation.patient_id,
      consultation_id: id,
      ...brief,
      created_by: existingBrief?.created_by ?? currentProfileId ?? typedConsultation.clinician_id,
      updated_by: currentProfileId ?? typedConsultation.clinician_id,
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let { data: savedBrief, error: saveError } = await supabase
      .from('visit_briefs')
      .upsert(payload, { onConflict: 'consultation_id' })
      .select()
      .single();

    if (saveError && missingBriefOwnershipCodes.has(saveError.code)) {
      const fallbackPayload = {
        clinic_id: typedConsultation.clinic_id,
        patient_id: typedConsultation.patient_id,
        consultation_id: id,
        ...brief,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const fallbackResult = await supabase
        .from('visit_briefs')
        .upsert(fallbackPayload, { onConflict: 'consultation_id' })
        .select()
        .single();

      savedBrief = fallbackResult.data;
      saveError = fallbackResult.error;
    }

    if (saveError) {
      if (missingWorkflowSchemaCodes.has(saveError.code)) {
        return NextResponse.json(payload);
      }
      throw saveError;
    }

    await supabase
      .from('consultations')
      .update({ status: 'brief_ready', updated_at: new Date().toISOString() })
      .eq('id', id)
      .in('status', ['scheduled', 'brief_ready']);

    return NextResponse.json(savedBrief);
  } catch (error) {
    console.error('Brief generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate brief';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
