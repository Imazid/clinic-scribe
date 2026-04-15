import { createClient } from '@/lib/supabase/client';
import type {
  CareTask,
  CareTaskStatus,
  Consultation,
  EvidenceAnswer,
  EvidenceQueryScope,
  GeneratedDocument,
  QAFinding,
  NoteProvenanceItem,
  VisitBrief,
  PatientSummary,
  SOAPNote,
} from '@/lib/types';
import { normalizeVisitBrief } from '@/lib/visit-brief';

const supabase = () => createClient();
const missingWorkflowSchemaCodes = new Set(['PGRST200', 'PGRST205']);

export async function getPreparationQueue(clinicId: string) {
  let { data, error } = await supabase()
    .from('consultations')
    .select('*, patient:patients(*), visit_brief:visit_briefs(*)')
    .eq('clinic_id', clinicId)
    .in('status', ['scheduled', 'brief_ready', 'recording', 'review_pending', 'closeout_pending'])
    .order('scheduled_for', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error && missingWorkflowSchemaCodes.has(error.code)) {
    const fallback = await supabase()
      .from('consultations')
      .select('*, patient:patients(*)')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;
  return (data || []).map((consultation) => {
    const raw = consultation as Record<string, unknown>;
    if (Array.isArray(raw.visit_brief)) raw.visit_brief = raw.visit_brief[0] ?? null;
    raw.visit_brief = normalizeVisitBrief(raw.visit_brief as VisitBrief | null | undefined);
    return raw as unknown as Consultation;
  });
}

export async function getVisitBriefs(clinicId: string) {
  const { data, error } = await supabase()
    .from('visit_briefs')
    .select('*, consultation:consultations(*, patient:patients(*))')
    .eq('clinic_id', clinicId)
    .order('updated_at', { ascending: false });

  if (error && missingWorkflowSchemaCodes.has(error.code)) {
    return [];
  }
  if (error) throw error;
  return (data || []).flatMap((brief) => {
    const normalized = normalizeVisitBrief(brief as VisitBrief | null | undefined);
    return normalized ? [normalized] : [];
  });
}

export async function generateVisitBrief(
  consultationId: string,
  options: { force?: boolean } = {}
): Promise<{ brief: VisitBrief; cached: boolean }> {
  const qs = options.force ? '?force=true' : '';
  const res = await fetch(`/api/consultations/${consultationId}/brief/generate${qs}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate visit brief');
  }

  const json = (await res.json()) as { brief?: VisitBrief; cached?: boolean } | VisitBrief;
  // Back-compat: older responses returned the bare VisitBrief.
  if (json && typeof json === 'object' && 'brief' in json && json.brief) {
    return {
      brief: normalizeVisitBrief(json.brief) ?? json.brief,
      cached: Boolean(json.cached),
    };
  }
  return {
    brief: normalizeVisitBrief(json as VisitBrief) ?? (json as VisitBrief),
    cached: false,
  };
}

export async function getVerificationQueue(clinicId: string) {
  const { data, error } = await supabase()
    .from('consultations')
    .select('*, patient:patients(*), clinical_note:clinical_notes(*)')
    .eq('clinic_id', clinicId)
    .in('status', ['generating', 'review_pending', 'approved', 'closeout_pending'])
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((consultation) => {
    const raw = consultation as Record<string, unknown>;
    if (Array.isArray(raw.clinical_note)) {
      raw.clinical_note = raw.clinical_note[raw.clinical_note.length - 1] ?? null;
    }
    return raw as unknown as Consultation;
  });
}

export async function generateProvenance(
  consultationId: string,
  payload: Record<string, unknown>
) {
  const res = await fetch(`/api/consultations/${consultationId}/note/provenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate provenance');
  }

  return (await res.json()) as { provenance_map: NoteProvenanceItem[] };
}

export async function generateQAFindings(
  consultationId: string,
  payload: Record<string, unknown>
) {
  const res = await fetch(`/api/consultations/${consultationId}/note/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to generate QA findings');
  }

  return (await res.json()) as {
    qa_findings: QAFinding[];
    verification_status: string;
  };
}

export async function materializeCloseout(consultationId: string, noteId?: string) {
  const res = await fetch(`/api/consultations/${consultationId}/close/materialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to materialize closeout');
  }

  return (await res.json()) as {
    patient_summary: PatientSummary;
    task_count: number;
    document_count: number;
  };
}

export async function getEvidenceQueries(consultationId: string) {
  const res = await fetch(`/api/consultations/${consultationId}/evidence/query`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to load evidence queries');
  }

  return (await res.json()) as { evidence_queries: EvidenceAnswer[] };
}

export async function queryEvidence(
  consultationId: string,
  payload: {
    question: string;
    scope: EvidenceQueryScope;
    linkedFindingCode?: string | null;
    note?: SOAPNote;
    finding?: QAFinding | null;
    createdBy?: string | null;
  }
) {
  const res = await fetch(`/api/consultations/${consultationId}/evidence/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to query evidence');
  }

  return (await res.json()) as { evidence_query: EvidenceAnswer };
}

export async function updateEvidenceQueryStatus(
  consultationId: string,
  payload: { id: string; status: 'draft' | 'accepted'; acceptedBy?: string | null }
) {
  const res = await fetch(`/api/consultations/${consultationId}/evidence/query`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update evidence query');
  }

  return (await res.json()) as { evidence_query: Partial<EvidenceAnswer> & { id: string } };
}

export async function getCareTasks(clinicId: string, status: CareTaskStatus | 'all' = 'all') {
  let query = supabase()
    .from('care_tasks')
    .select('*, patient:patients(*), consultation:consultations(*, patient:patients(*))')
    .eq('clinic_id', clinicId)
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error && missingWorkflowSchemaCodes.has(error.code)) {
    return [];
  }
  if (error) throw error;
  return data as CareTask[];
}

export async function updateCareTaskStatus(taskId: string, status: CareTaskStatus) {
  const { data, error } = await supabase()
    .from('care_tasks')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as CareTask;
}

export async function createCareTask(payload: {
  clinicId: string;
  patientId: string;
  consultationId: string;
  title: string;
  description?: string;
  dueAt?: string | null;
  category?: CareTask['category'];
  ownerUserId?: string | null;
}) {
  const { data, error } = await supabase()
    .from('care_tasks')
    .insert({
      clinic_id: payload.clinicId,
      patient_id: payload.patientId,
      consultation_id: payload.consultationId,
      title: payload.title.trim(),
      description: payload.description?.trim() || payload.title.trim(),
      due_at: payload.dueAt || null,
      status: 'open',
      category: payload.category ?? 'follow_up',
      owner_user_id: payload.ownerUserId ?? null,
      source: 'manual',
      metadata: { created_from: 'tasks_workspace' },
    })
    .select('*, patient:patients(*), consultation:consultations(*, patient:patients(*))')
    .single();

  if (error) throw error;
  return data as CareTask;
}

export async function getGeneratedDocuments(clinicId: string) {
  const { data, error } = await supabase()
    .from('generated_documents')
    .select('*, patient:patients(*), consultation:consultations(*)')
    .eq('clinic_id', clinicId)
    .order('updated_at', { ascending: false });

  if (error && missingWorkflowSchemaCodes.has(error.code)) {
    return [];
  }
  if (error) throw error;
  return data as GeneratedDocument[];
}

export async function updateGeneratedDocument(
  documentId: string,
  updates: Partial<Pick<GeneratedDocument, 'status' | 'content' | 'title' | 'metadata'>>
) {
  const { data, error } = await supabase()
    .from('generated_documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select('*, patient:patients(*), consultation:consultations(*)')
    .single();

  if (error) throw error;
  return data as GeneratedDocument;
}

export async function getPatientTimeline(patientId: string) {
  const res = await fetch(`/api/patients/${patientId}/timeline`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to load patient timeline');
  }

  return (await res.json()) as { events: Array<Record<string, unknown>> };
}
