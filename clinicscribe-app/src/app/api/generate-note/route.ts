import { NextResponse } from 'next/server';
import { generateClinicalNoteArtifact } from '@/lib/ai/note-generation';
import {
  requireUser,
  rateLimit,
  checkOrigin,
  forbidden,
  tooMany,
  logError,
} from '@/lib/apiSecurity';

export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response } = await requireUser();
  if (response) return response;

  if (!rateLimit(`generate-note:${user.id}`, 10, 60_000)) return tooMany();

  try {
    const { transcript, patientContext, consultationId, templateKey, template } =
      await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    if (consultationId) {
      const { data: consultation, error: ownershipError } = await supabase
        .from('consultations')
        .select('id, clinic_id')
        .eq('id', consultationId)
        .single();

      if (ownershipError || !consultation) {
        return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.clinic_id !== consultation.clinic_id) {
        return forbidden();
      }
    }

    const noteData = await generateClinicalNoteArtifact({
      transcript,
      patientContext,
      consultationId,
      templateKey: templateKey ?? template?.id ?? null,
      template: template ?? null,
    });
    return NextResponse.json(noteData);
  } catch (error) {
    logError('generate-note', error);
    return NextResponse.json({ error: 'Note generation failed' }, { status: 500 });
  }
}
