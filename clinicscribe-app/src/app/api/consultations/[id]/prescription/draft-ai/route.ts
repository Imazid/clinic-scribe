import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePrescriptionDraft } from '@/lib/ai/prescription-draft';
import { checkOrigin, forbidden, getRequestIp, logError, writeAuditLog } from '@/lib/apiSecurity';

export const maxDuration = 60;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  try {
    const { id: consultationId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve user's profile / clinic for the ownership check.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, clinic_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    // Pull consultation with patient context.
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*, patient:patients(*)')
      .eq('id', consultationId)
      .maybeSingle();

    if (consultationError) {
      return NextResponse.json(
        { error: consultationError.message },
        { status: 500 }
      );
    }
    if (!consultation) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }
    if (consultation.clinic_id !== profile.clinic_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pull latest transcript + clinical note for context. Both optional —
    // the AI module handles whichever combination is available.
    const [{ data: transcriptRow }, { data: clinicalNoteRow }] = await Promise.all([
      supabase
        .from('transcripts')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('clinical_notes')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const transcriptText = extractTranscriptText(transcriptRow);

    if (!transcriptText && !clinicalNoteRow) {
      return NextResponse.json(
        { error: 'No transcript or clinical note available for this consultation yet' },
        { status: 400 }
      );
    }

    const patient = consultation.patient as
      | {
          first_name?: string;
          last_name?: string;
          date_of_birth?: string;
          sex?: string;
        }
      | null;

    const patientContext = patient
      ? [
          `Name: ${[patient.first_name, patient.last_name].filter(Boolean).join(' ')}`.trim(),
          patient.date_of_birth ? `DOB: ${patient.date_of_birth}` : null,
          patient.sex ? `Sex: ${patient.sex}` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : undefined;

    const items = await generatePrescriptionDraft({
      transcript: transcriptText,
      clinicalNote: clinicalNoteRow ?? undefined,
      patientContext,
    });

    // Audit trail — best-effort, never blocks the response.
    try {
      await writeAuditLog(supabase, {
        clinicId: profile.clinic_id,
        userId: user.id,
        action: 'prescription_drafted_ai',
        entityType: 'consultation',
        entityId: consultationId,
        details: {
          item_count: items.length,
          had_transcript: Boolean(transcriptText),
          had_clinical_note: Boolean(clinicalNoteRow),
        },
        ipAddress: getRequestIp(request),
      });
    } catch (auditErr) {
      logError('prescription-draft-ai-audit', auditErr);
    }

    return NextResponse.json({ items });
  } catch (error) {
    logError('prescription-draft-ai', error);
    return NextResponse.json(
      { error: 'Failed to generate prescription draft' },
      { status: 500 }
    );
  }
}

function extractTranscriptText(row: unknown): string | undefined {
  if (!row || typeof row !== 'object') return undefined;
  const r = row as Record<string, unknown>;
  // Try common column shapes: text/content can be a string or JSON.
  for (const key of ['text', 'content', 'body', 'transcript']) {
    const value = r[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (value && typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        /* ignore */
      }
    }
  }
  return undefined;
}
