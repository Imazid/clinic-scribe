import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEvidenceAnswer } from '@/lib/ai/evidence';
import { selectEvidenceSources } from '@/lib/evidence/library';
import { checkOrigin, forbidden, rateLimit, requireUser, tooMany } from '@/lib/apiSecurity';
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
  try {
    const { id } = await context.params;
    const supabase = await createClient();

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
    console.error('Evidence query fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to load evidence queries';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');
  const { user, response } = await requireUser();
  if (response) return response;
  if (!rateLimit(`evidence-query:${user.id}`, 20, 60_000)) return tooMany();

  try {
    const { id } = await context.params;
    const body = (await request.json()) as EvidenceQueryBody;
    const supabase = await createClient();

    if (!body.question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const { data: consultation, error } = await supabase
      .from('consultations')
      .select('clinic_id, patient_id, patient:patients(*)')
      .eq('id', id)
      .single();

    if (error || !consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

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
    console.error('Evidence query generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate evidence query';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');
  try {
    const body = (await request.json()) as EvidenceStatusBody;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('evidence_queries')
      .update({
        status: body.status,
        accepted_by: body.status === 'accepted' ? body.acceptedBy || null : null,
        accepted_at: body.status === 'accepted' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
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
    console.error('Evidence query update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update evidence query';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
