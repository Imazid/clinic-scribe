import { createClient } from '@/lib/supabase/client';
import type { Prescription, PrescriptionItem, PrescriptionStatus } from '@/lib/types';

const supabase = () => createClient();
const missingRelationCodes = new Set(['PGRST200', 'PGRST205']);

const FULL_SELECT =
  '*, patient:patients(*), consultation:consultations(*, patient:patients(*))';

export interface CreatePrescriptionInput {
  clinicId: string;
  patientId: string;
  consultationId: string | null;
  clinicalNoteId?: string | null;
  items: PrescriptionItem[];
  notes?: string | null;
  draftedBy?: string | null;
}

export async function createPrescriptionDraft(input: CreatePrescriptionInput) {
  const { data, error } = await supabase()
    .from('prescriptions')
    .insert({
      clinic_id: input.clinicId,
      patient_id: input.patientId,
      consultation_id: input.consultationId,
      clinical_note_id: input.clinicalNoteId ?? null,
      status: 'draft',
      items: input.items,
      notes: input.notes ?? null,
      drafted_by: input.draftedBy ?? null,
    })
    .select(FULL_SELECT)
    .single();

  if (error) throw error;
  return data as Prescription;
}

export interface UpdatePrescriptionInput {
  items?: PrescriptionItem[];
  notes?: string | null;
  status?: PrescriptionStatus;
}

export async function updatePrescription(
  prescriptionId: string,
  updates: UpdatePrescriptionInput
) {
  const { data, error } = await supabase()
    .from('prescriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prescriptionId)
    .select(FULL_SELECT)
    .single();

  if (error) throw error;
  return data as Prescription;
}

export async function approvePrescription(
  prescriptionId: string,
  approvedBy: string | null
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase()
    .from('prescriptions')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: now,
      updated_at: now,
    })
    .eq('id', prescriptionId)
    .select(FULL_SELECT)
    .single();

  if (error) throw error;
  return data as Prescription;
}

export async function getPrescription(prescriptionId: string) {
  const { data, error } = await supabase()
    .from('prescriptions')
    .select(FULL_SELECT)
    .eq('id', prescriptionId)
    .maybeSingle();

  if (error && missingRelationCodes.has(error.code)) return null;
  if (error) throw error;
  return (data as Prescription | null) ?? null;
}

export async function getPrescriptionsForConsultation(consultationId: string) {
  const { data, error } = await supabase()
    .from('prescriptions')
    .select(FULL_SELECT)
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: false });

  if (error && missingRelationCodes.has(error.code)) return [];
  if (error) throw error;
  return (data as Prescription[]) ?? [];
}

export async function getPrescriptionsForClinic(
  clinicId: string,
  filters: { status?: PrescriptionStatus | 'all'; limit?: number } = {}
) {
  let query = supabase()
    .from('prescriptions')
    .select(FULL_SELECT)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error && missingRelationCodes.has(error.code)) return [];
  if (error) throw error;
  return (data as Prescription[]) ?? [];
}

export function createPrescriptionItemFromDraft(draft: {
  name?: string;
  dose?: string;
  frequency?: string;
  quantity?: string | number | null;
}): PrescriptionItem {
  const qty =
    typeof draft.quantity === 'number'
      ? draft.quantity
      : draft.quantity
        ? Number(String(draft.quantity).replace(/[^\d]/g, '')) || null
        : null;
  return {
    name: draft.name ?? '',
    strength: null,
    form: null,
    dose: draft.dose ?? '',
    frequency: draft.frequency ?? '',
    duration: null,
    quantity: qty,
    repeats: null,
    instructions: null,
  };
}
