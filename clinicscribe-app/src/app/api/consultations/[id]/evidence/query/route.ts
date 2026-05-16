import { NextResponse } from 'next/server';
import { generateEvidenceAnswer } from '@/lib/ai/evidence';
import { selectEvidenceSources } from '@/lib/evidence/library';
import {
  checkOrigin,
  forbidden,
  logError,
  notFound,
  rateLimit,
  requireCallerClinic,
  requireUser,
  tooMany,
} from '@/lib/apiSecurity';
import type {
  EvidenceAnswer,
  EvidenceQueryScope,
  Patient,
  QAFinding,
  SOAPNote,
} from '@/lib/types';

const missingWorkflowSchemaCodes = new Set(['PGRST200', 'PGRST205']);

interface EvidenceQueryBody {
  question: string;
  scope: EvidenceQueryScope;
  linkedFindingCode?: string | null;
  note?: SOAPNote;
  finding?: QAFinding | null;
  createdBy?: string | null;
}

interface EvidenceStatusBody {
  id: string;
  status: 'draft' | 'accepted';
  acceptedBy?: string | null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;

  try {
    const { id } = await context.params;

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    // Verify the consultation belongs to the caller's clinic before listing
    // its evidence queries — defence in depth on top of RLS.
    const { data: consultation } = await supabase
      .from('consultations')
      .select('clinic_id')
      .eq('id', id)
      .maybeSingle();

    if (!consultation) return notFound('Consultation not found');
    if (consultation.clinic_id !== clinicId) return notFound('Consultation not found');

    const { data, error } = await supabase
      .from('evidence_queries')
      .select('*')
      .eq('consultation_id', id)
      .order('created_at', { ascending: false });

    if (error && missingWorkflowSchemaCodes.has(error.code)) {
      return NextResponse.json({ evidence_queries: [] });
    }

    if (error) throw error;

    return NextResponse.json({
      evidence_queries: (data || []) as EvidenceAnswer[],
    });
  } catch (error) {
    logError('evidence-query-list', error);
    return NextResponse.json(
      { error: 'Failed to load evidence queries' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');
  const { user, supabase, response } = await requireUser();
  if (response) return response;
  if (!(await rateLimit(`evidence-query:${user.id}`, 20, 60_000))) return tooMany();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as EvidenceQueryBody;

    if (!body.question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    const { data: consultation, error } = await supabase
      .from('consultations')
      .select('clinic_id, patient_id, patient:patients(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !consultation) return notFound('Consultation not found');
    if (consultation.clinic_id !== clinicId) return notFound('Consultation not found');

    const typedConsultation = consultation as unknown as {
      clinic_id: string;
      patient_id: string;
      patient: Patient | null;
    };

    const sources = selectEvidenceSources({
      question: body.question,
      scope: body.scope,
      finding: body.finding || null,
      patient: typedConsultation.patient,
    });

    const result = await generateEvidenceAnswer({
      question: body.question,
      scope: body.scope,
      sources,
      note: body.note,
      patient: typedConsultation.patient,
      finding: body.finding || null,
    });

    const payload = {
      clinic_id: typedConsultation.clinic_id,
      patient_id: typedConsultation.patient_id,
      consultation_id: id,
      question: body.question,
      scope: body.scope,
      linked_finding_code: body.linkedFindingCode || null,
      answer: result.answer,
      key_points: result.key_points,
      citations: result.citations,
      status: 'draft' as const,
      created_by: body.createdBy || null,
      accepted_by: null,
      accepted_at: null,
      updated_at: new Date().toISOString(),
    };

    const { data: savedQuery, error: saveError } = await supabase
      .from('evidence_queries')
      .insert(payload)
      .select()
      .single();

    if (saveError && missingWorkflowSchemaCodes.has(saveError.code)) {
      return NextResponse.json({
        evidence_query: {
          id: `temp-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString(),
        } satisfies EvidenceAnswer,
      });
    }

    if (saveError) throw saveError;

    return NextResponse.json({
      evidence_query: savedQuery as EvidenceAnswer,
    });
  } catch (error) {
    logError('evidence-query-create', error);
    return NextResponse.json(
      { error: 'Failed to generate evidence query' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;
  if (!(await rateLimit(`evidence-query-patch:${user.id}`, 30, 60_000))) return tooMany();

  try {
    const body = (await request.json()) as EvidenceStatusBody;

    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { clinicId, response: clinicError } = await requireCallerClinic(
      supabase,
      user.id
    );
    if (clinicError) return clinicError;

    // Ownership gate: load the row, confirm it belongs to the caller's clinic
    // before updating. Without this, an authenticated caller could PATCH
    // arbitrary evidence_queries rows by ID even if RLS is misconfigured.
    const { data: existing } = await supabase
      .from('evidence_queries')
      .select('id, clinic_id')
      .eq('id', body.id)
      .maybeSingle();

    if (!existing) {
      // Schema-missing fallback preserved for envs where workflow schema
      // hasn't shipped — same shape as the original handler.
      return NextResponse.json({
        evidence_query: {
          id: body.id,
          status: body.status,
          accepted_by: body.acceptedBy || null,
          accepted_at: body.status === 'accepted' ? new Date().toISOString() : null,
        },
      });
    }
    if (existing.clinic_id !== clinicId) {
      return notFound('Evidence query not found');
    }

    const { data, error } = await supabase
      .from('evidence_queries')
      .update({
        status: body.status,
        accepted_by: body.status === 'accepted' ? body.acceptedBy || null : null,
        accepted_at: body.status === 'accepted' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('clinic_id', clinicId)
      .select()
      .single();

    if (error && missingWorkflowSchemaCodes.has(error.code)) {
      return NextResponse.json({
        evidence_query: {
          id: body.id,
          status: body.status,
          accepted_by: body.acceptedBy || null,
          accepted_at: body.status === 'accepted' ? new Date().toISOString() : null,
        },
      });
    }

    if (error) throw error;

    return NextResponse.json({
      evidence_query: data as EvidenceAnswer,
    });
  } catch (error) {
    logError('evidence-query-patch', error);
    return NextResponse.json(
      { error: 'Failed to update evidence query' },
      { status: 500 }
    );
  }
}
