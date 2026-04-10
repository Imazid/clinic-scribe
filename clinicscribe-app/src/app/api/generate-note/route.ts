import { NextResponse } from 'next/server';
import { generateClinicalNoteArtifact } from '@/lib/ai/note-generation';

export async function POST(request: Request) {
  try {
    const { transcript, patientContext, consultationId, templateKey, template } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
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
    console.error('Note generation error:', error);
    const message = error instanceof Error ? error.message : 'Note generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
