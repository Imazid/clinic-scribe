import { createClient } from '@/lib/supabase/client';
import type { Consultation, ConsultationStatus } from '@/lib/types';

const supabase = () => createClient();

export async function getConsultations(clinicId: string, status?: string) {
  let query = supabase()
    .from('consultations')
    .select('*, patient:patients(*), clinician:profiles(*)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Consultation[];
}

export async function getConsultation(id: string) {
  const { data, error } = await supabase()
    .from('consultations')
    .select('*, patient:patients(*), clinician:profiles(*), audio_recording:audio_recordings(*), transcript:transcripts(*), clinical_note:clinical_notes(*)')
    .eq('id', id)
    .single();
  if (error) throw error;

  // Supabase returns one-to-many joins as arrays — normalize to single objects
  const raw = data as Record<string, unknown>;
  if (Array.isArray(raw.audio_recording)) raw.audio_recording = raw.audio_recording[0] ?? null;
  if (Array.isArray(raw.transcript)) raw.transcript = raw.transcript[0] ?? null;
  if (Array.isArray(raw.clinical_note)) raw.clinical_note = raw.clinical_note[raw.clinical_note.length - 1] ?? null;

  return raw as unknown as Consultation;
}

export async function createConsultation(clinicId: string, clinicianId: string, patientId: string, consultationType: string) {
  const { data, error } = await supabase()
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
  if (error) throw error;
  return data as Consultation;
}

export async function updateConsultationStatus(id: string, status: ConsultationStatus) {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'approved') updates.completed_at = new Date().toISOString();

  const { error } = await supabase().from('consultations').update(updates).eq('id', id);
  if (error) throw error;
}
