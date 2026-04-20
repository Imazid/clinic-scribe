import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeVisitBrief } from '@/lib/visit-brief';
import { buildVisitBriefArtifact } from '@/lib/workflow/artifacts';
import { checkOrigin, forbidden, rateLimit, requireUser, tooMany } from '@/lib/apiSecurity';
import type { CareTask, ClinicalNote, Consultation, VisitBrief } from '@/lib/types';

const missingWorkflowSchemaCodes = new Set(['PGRST200', 'PGRST205']);
const missingBriefOwnershipCodes = new Set(['42703', 'PGRST204']);

// Briefs older than this are rebuilt even when no underlying record has changed.
const BRIEF_TTL_MS = 24 * 60 * 60 * 1000;

type ConsultationRow = Consultation & {
  patient: Consultation['patient'];
  clinical_note: ClinicalNote[] | ClinicalNote | null;
};

type ExistingBriefRow = VisitBrief & { created_by?: string | null };

function withinTtl(generatedAt: string | null | undefined): boolean {
  if (!generatedAt) return false;
  const t = new Date(generatedAt).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < BRIEF_TTL_MS;
}

function isAfter(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return new Date(a).getTime() > new Date(b).getTime();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');
  const { user, response } = await requireUser();
  if (response) return response;
  if (!rateLimit(`brief-generate:${user.id}`, 10, 60_000)) return tooMany();

  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

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

    // --- Freshness check: can we return a cached brief? ---
    if (!force) {
      const { data: existingBrief } = await supabase
        .from('visit_briefs')
        .select('*')
        .eq('consultation_id', id)
        .maybeSingle();

      const typedExisting = normalizeVisitBrief(
        existingBrief as ExistingBriefRow | null
      ) as ExistingBriefRow | null;

      if (
        typedExisting &&
        typedExisting.status === 'ready' &&
        withinTtl(typedExisting.generated_at)
      ) {
        // Check nothing material has changed since generated_at.
        const patientUpdatedAt = typedConsultation.patient.updated_at ?? null;
        const briefGeneratedAt = typedExisting.generated_at;

        // Find the newest approved clinical note for this patient — if one
        // landed after the brief was built, the brief is stale.
        const { data: newerNotes } = await supabase
          .from('clinical_notes')
          .select('updated_at')
          .eq('patient_id', typedConsultation.patient_id)
          .eq('is_approved', true)
          .order('updated_at', { ascending: false })
          .limit(1);

        const latestApprovedNoteAt = newerNotes?.[0]?.updated_at ?? null;

        const patientNewer = isAfter(patientUpdatedAt, briefGeneratedAt);
        const noteNewer = isAfter(latestApprovedNoteAt, briefGeneratedAt);

        if (!patientNewer && !noteNewer) {
          return NextResponse.json({ brief: typedExisting, cached: true });
        }

        // Mark stale so future reads in the UI can flag it too.
        await supabase
          .from('visit_briefs')
          .update({ status: 'stale', updated_at: new Date().toISOString() })
          .eq('id', typedExisting.id);
      }
    }

    // --- Regenerate path ---
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
        return NextResponse.json({
          brief: normalizeVisitBrief(payload as unknown as VisitBrief) ?? (payload as unknown as VisitBrief),
          cached: false,
        });
      }
      throw saveError;
    }

    await supabase
      .from('consultations')
      .update({ status: 'brief_ready', updated_at: new Date().toISOString() })
      .eq('id', id)
      .in('status', ['scheduled', 'brief_ready']);

    return NextResponse.json({
      brief: normalizeVisitBrief(savedBrief as VisitBrief | null | undefined) ?? (savedBrief as VisitBrief),
      cached: false,
    });
  } catch (error) {
    console.error('Brief generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate brief';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
