import { createClient } from '@/lib/supabase/client';
import type { Patient } from '@/lib/types';
import type { PatientInput } from '@/lib/validators';

const supabase = () => createClient();

export async function getPatients(clinicId: string, search?: string, consentFilter?: string) {
  let query = supabase()
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,mrn.ilike.%${search}%`);
  }
  if (consentFilter && consentFilter !== 'all') {
    query = query.eq('consent_status', consentFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Patient[];
}

export async function getPatient(id: string) {
  const { data, error } = await supabase()
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function createPatient(clinicId: string, input: PatientInput) {
  const { data, error } = await supabase()
    .from('patients')
    .insert({ ...input, clinic_id: clinicId })
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, input: Partial<PatientInput>) {
  const { data, error } = await supabase()
    .from('patients')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
}

/**
 * Best-effort denormalisation: stamp `patients.last_appointment_at` when a
 * consultation is created or actually begins. Never throws — a failure to
 * update the column should never block consultation flow.
 */
export async function touchPatientLastAppointment(
  patientId: string,
  timestamp: string = new Date().toISOString()
) {
  try {
    const { error } = await supabase()
      .from('patients')
      .update({ last_appointment_at: timestamp, updated_at: new Date().toISOString() })
      .eq('id', patientId);
    if (error) {
      console.warn('touchPatientLastAppointment failed:', error.message);
    }
  } catch (err) {
    console.warn('touchPatientLastAppointment threw:', err);
  }
}

export async function getPatientConsultations(patientId: string) {
  const { data, error } = await supabase()
    .from('consultations')
    .select('*, clinician:profiles(*), clinical_note:clinical_notes(*)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
