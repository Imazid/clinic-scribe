import { createClient } from '@/lib/supabase/client';
import type { Consultation, ConsultationStatus } from '@/lib/types';

const supabase = () => createClient();
const missingRelationCodes = new Set(['PGRST200', 'PGRST205']);
const fallbackStatuses: Partial<Record<ConsultationStatus, ConsultationStatus>> = {
  scheduled: 'recording',
  brief_ready: 'recording',
  closeout_pending: 'approved',
  closed: 'approved',
};

export async function getConsultations(clinicId: string, status?: string) {
  let query = supabase()
    .from('consultations')
    .select('*, patient:patients(*), clinician:profiles(*), visit_brief:visit_briefs(*)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  let { data, error } = await query;

  if (error && missingRelationCodes.has(error.code)) {
    let fallbackQuery = supabase()
      .from('consultations')
      .select('*, patient:patients(*), clinician:profiles(*)')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      fallbackQuery = fallbackQuery.eq('status', status);
    }

    const fallback = await fallbackQuery;
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  return (data || []).map((consultation) => {
    const raw = consultation as Record<string, unknown>;
    if (Array.isArray(raw.visit_brief)) raw.visit_brief = raw.visit_brief[0] ?? null;
    return raw as unknown as Consultation;
  });
}

export async function getConsultation(id: string) {
  let { data, error } = await supabase()
    .from('consultations')
    .select('*, patient:patients(*), clinician:profiles(*), audio_recording:audio_recordings(*), transcript:transcripts(*), clinical_note:clinical_notes(*), visit_brief:visit_briefs(*), care_tasks:care_tasks(*), generated_documents:generated_documents(*)')
    .eq('id', id)
    .single();

  if (error && missingRelationCodes.has(error.code)) {
    const fallback = await supabase()
      .from('consultations')
      .select('*, patient:patients(*), clinician:profiles(*), audio_recording:audio_recordings(*), transcript:transcripts(*), clinical_note:clinical_notes(*)')
      .eq('id', id)
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;

  // Supabase returns one-to-many joins as arrays — normalize to single objects
  const raw = data as Record<string, unknown>;
  if (Array.isArray(raw.audio_recording)) raw.audio_recording = raw.audio_recording[0] ?? null;
  if (Array.isArray(raw.transcript)) raw.transcript = raw.transcript[0] ?? null;
  if (Array.isArray(raw.clinical_note)) raw.clinical_note = raw.clinical_note[raw.clinical_note.length - 1] ?? null;
  if (Array.isArray(raw.visit_brief)) raw.visit_brief = raw.visit_brief[0] ?? null;

  return raw as unknown as Consultation;
}

export async function getConsultationsForPatient(clinicId: string, patientId: string) {
  const { data, error } = await supabase()
    .from('consultations')
    .select('id, clinic_id, patient_id, clinician_id, status, consultation_type, template_key, scheduled_for, reason_for_visit, source, duration_seconds, started_at, completed_at, created_at, updated_at')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Consultation[];
}

export async function createConsultation(
  clinicId: string,
  clinicianId: string,
  patientId: string,
  consultationType: string,
  templateKey?: string | null
) {
  let { data, error } = await supabase()
    .from('consultations')
    .insert({
      clinic_id: clinicId,
      clinician_id: clinicianId,
      patient_id: patientId,
      consultation_type: consultationType,
      template_key: templateKey ?? null,
      status: 'recording' as ConsultationStatus,
      scheduled_for: new Date().toISOString(),
      reason_for_visit: consultationType,
      source: 'manual',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    const fallback = await supabase()
      .from('consultations')
      .insert({
        clinic_id: clinicId,
        clinician_id: clinicianId,
        patient_id: patientId,
        consultation_type: consultationType,
        status: 'recording' as ConsultationStatus,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  return data as Consultation;
}

export async function updateConsultationStatus(id: string, status: ConsultationStatus) {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'closed' || status === 'exported') updates.completed_at = new Date().toISOString();

  let { error } = await supabase().from('consultations').update(updates).eq('id', id);

  if (error && fallbackStatuses[status]) {
    const fallbackUpdates: Record<string, unknown> = {
      status: fallbackStatuses[status],
      updated_at: new Date().toISOString(),
    };
    if (fallbackStatuses[status] === 'approved') {
      fallbackUpdates.completed_at = new Date().toISOString();
    }
    const fallback = await supabase().from('consultations').update(fallbackUpdates).eq('id', id);
    error = fallback.error;
  }

  if (error) throw error;
}
