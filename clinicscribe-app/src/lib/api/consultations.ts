import { createClient } from '@/lib/supabase/client';
import { touchPatientLastAppointment } from '@/lib/api/patients';
import type { Consultation, ConsultationStatus } from '@/lib/types';
import { normalizeVisitBrief } from '@/lib/visit-brief';

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
    raw.visit_brief = normalizeVisitBrief(raw.visit_brief as Consultation['visit_brief']);
    return raw as unknown as Consultation;
  });
}

export async function getRecentConsultations(clinicId: string, limit = 5) {
  const { data, error } = await supabase()
    .from('consultations')
    .select('*, patient:patients(*)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as unknown as Consultation[];
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
  raw.visit_brief = normalizeVisitBrief(raw.visit_brief as Consultation['visit_brief']);

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
  // Phase 3: keep patients.last_appointment_at current. Best-effort.
  await touchPatientLastAppointment(patientId);
  return data as Consultation;
}

export interface ScheduleAppointmentInput {
  clinicId: string;
  clinicianId: string;
  patientId: string;
  consultationType: string;
  /** ISO 8601 datetime when the consult should start. */
  scheduledFor: string;
  /** Optional duration in minutes — persisted as `duration_seconds`. */
  durationMinutes?: number;
  reasonForVisit?: string;
  templateKey?: string | null;
}

/**
 * Books a future appointment as a `scheduled` consultation row. The row is
 * the same `consultations` table we use for in-progress work — picking it up
 * later just transitions its status. Older DB envs that don't accept the
 * `scheduled` status fall back to inserting with no status (which Supabase
 * will default-fill).
 */
export async function createScheduledConsultation(input: ScheduleAppointmentInput): Promise<Consultation> {
  const payload: Record<string, unknown> = {
    clinic_id: input.clinicId,
    clinician_id: input.clinicianId,
    patient_id: input.patientId,
    consultation_type: input.consultationType,
    template_key: input.templateKey ?? null,
    status: 'scheduled' as ConsultationStatus,
    scheduled_for: input.scheduledFor,
    reason_for_visit: input.reasonForVisit ?? input.consultationType,
    source: 'manual',
    duration_seconds: input.durationMinutes ? input.durationMinutes * 60 : null,
  };

  let { data, error } = await supabase()
    .from('consultations')
    .insert(payload)
    .select('*, patient:patients(*), clinician:profiles(*)')
    .single();

  // Older environments may not accept either the `scheduled` status enum or
  // the `duration_seconds` column. Retry with a leaner payload before giving up.
  if (error) {
    delete payload.duration_seconds;
    const retry = await supabase()
      .from('consultations')
      .insert(payload)
      .select('*, patient:patients(*), clinician:profiles(*)')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  await touchPatientLastAppointment(input.patientId);
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

  // Phase 3: when a consultation actually starts, stamp the patient.
  // Avoid stamping on later lifecycle transitions (approved/closed) which can
  // arrive days after the visit and would rewind the timestamp.
  if (status === 'recording') {
    const { data: row } = await supabase()
      .from('consultations')
      .select('patient_id')
      .eq('id', id)
      .maybeSingle();
    const patientId = (row as { patient_id?: string } | null)?.patient_id;
    if (patientId) {
      await touchPatientLastAppointment(patientId);
    }
  }
}

/**
 * Delete a consultation and all of its dependent rows (audio recordings,
 * transcripts, clinical notes, care tasks, audit logs). Children are deleted
 * first to satisfy FK constraints. Missing child tables are ignored via the
 * PGRST fallback codes so older environments stay compatible.
 */
export async function deleteConsultation(id: string): Promise<void> {
  const client = supabase();
  const childTables = [
    'audio_recordings',
    'transcripts',
    'clinical_notes',
    'care_tasks',
    'generated_documents',
    'visit_briefs',
    'audit_logs',
  ];

  for (const table of childTables) {
    const { error } = await client.from(table).delete().eq('consultation_id', id);
    if (error && !missingRelationCodes.has(error.code) && error.code !== '42P01') {
      // 42P01 = undefined_table (table doesn't exist yet in some envs)
      throw error;
    }
  }

  const { error } = await client.from('consultations').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Delete every consultation for a clinic that has no meaningful content:
 * no audio, no transcript, no clinical note, and still in an early status.
 * Returns the number of consultations removed.
 */
export async function deleteEmptyConsultations(clinicId: string): Promise<number> {
  const client = supabase();

  // Pull candidate rows — limit to early statuses so we don't touch approved/closed work.
  const { data: candidates, error } = await client
    .from('consultations')
    .select('id, status, audio_recording:audio_recordings(id), transcript:transcripts(id), clinical_note:clinical_notes(id)')
    .eq('clinic_id', clinicId)
    .in('status', ['scheduled', 'brief_ready', 'recording', 'draft']);

  let rows: Array<Record<string, unknown>> = candidates ?? [];

  if (error) {
    if (!missingRelationCodes.has(error.code)) throw error;
    // Fallback: no embedded relations — fetch plain IDs and assume they're empty candidates.
    const fallback = await client
      .from('consultations')
      .select('id, status')
      .eq('clinic_id', clinicId)
      .in('status', ['scheduled', 'brief_ready', 'recording', 'draft']);
    if (fallback.error) throw fallback.error;
    rows = fallback.data ?? [];
  }

  const emptyIds = rows
    .filter((row) => {
      const audio = row.audio_recording;
      const transcript = row.transcript;
      const note = row.clinical_note;
      const hasAudio = Array.isArray(audio) ? audio.length > 0 : Boolean(audio);
      const hasTranscript = Array.isArray(transcript) ? transcript.length > 0 : Boolean(transcript);
      const hasNote = Array.isArray(note) ? note.length > 0 : Boolean(note);
      return !hasAudio && !hasTranscript && !hasNote;
    })
    .map((row) => row.id as string);

  let removed = 0;
  for (const id of emptyIds) {
    try {
      await deleteConsultation(id);
      removed += 1;
    } catch {
      // Skip rows we can't clean up — don't block the batch on a single failure.
    }
  }
  return removed;
}
