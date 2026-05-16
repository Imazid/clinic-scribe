import { createClient } from '@/lib/supabase/client';
import type { Prescription, PrescriptionItem, PrescriptionStatus } from '@/lib/types';
import { createAuditLog } from '@/lib/api/audit';

const supabase = () => createClient();

/** Best-effort audit write — never blocks the caller, never throws. */
async function audit(
  clinicId: string,
  action: string,
  prescriptionId: string,
  details: Record<string, unknown> = {}
) {
  try {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) return;
    await createAuditLog(clinicId, user.id, action, 'prescription', prescriptionId, details);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[audit:prescription]', action, err);
    }
  }
}
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
  const created = data as Prescription;
  audit(input.clinicId, 'prescription_drafted', created.id, {
    item_count: input.items.length,
    consultation_id: input.consultationId,
  });
  return created;
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
  const updated = data as Prescription;
  audit(updated.clinic_id, 'prescription_updated', updated.id, {
    item_count: updates.items?.length,
    has_status_change: Boolean(updates.status),
  });
  return updated;
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
  const approved = data as Prescription;
  audit(approved.clinic_id, 'prescription_approved', approved.id, {
    approved_at: approved.approved_at,
    item_count: approved.items.length,
  });
  return approved;
}

/**
 * Server-side AI prescription draft. Returns extracted PrescriptionItems for
 * the dialog to populate locally — does NOT save. The clinician reviews and
 * approves via the existing Save Draft / Approve flow.
 */
export async function generateAIPrescriptionDraft(
  consultationId: string
): Promise<PrescriptionItem[]> {
  const res = await fetch(
    `/api/consultations/${consultationId}/prescription/draft-ai`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? 'Failed to generate prescription draft'
    );
  }
  return ((data as { items?: PrescriptionItem[] }).items ?? []) as PrescriptionItem[];
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
