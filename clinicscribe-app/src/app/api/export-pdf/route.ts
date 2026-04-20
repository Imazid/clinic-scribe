import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { ClinicalNoteDocument } from '@/lib/pdf/ClinicalNoteDocument';
import type { FollowUpTask, MedicationDraft, SOAPNote } from '@/lib/types';
import {
  requireUser,
  rateLimit,
  checkOrigin,
  forbidden,
  tooMany,
  logError,
} from '@/lib/apiSecurity';

interface ExportPdfPayload {
  content: SOAPNote;
  patientName: string;
  consultationDate: string;
  clinicianName: string;
  clinicName?: string;
  medications?: MedicationDraft[];
  followUpTasks?: FollowUpTask[];
  referrals?: string[];
  consultationId?: string;
  noteId?: string;
}

function sanitizeFilename(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response } = await requireUser();
  if (response) return response;

  if (!rateLimit(`export-pdf:${user.id}`, 30, 60_000)) return tooMany();

  try {
    const body = (await request.json()) as ExportPdfPayload;

    if (!body?.content || !body.patientName) {
      return NextResponse.json(
        { error: 'content and patientName are required' },
        { status: 400 }
      );
    }

    let profileId: string | null = null;

    if (body.consultationId) {
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id, clinic_id')
        .eq('id', body.consultationId)
        .single();

      if (!consultation) {
        return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, clinic_id')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.clinic_id !== consultation.clinic_id) {
        return forbidden();
      }
      profileId = profile.id;
    }

    const documentElement = React.createElement(ClinicalNoteDocument, {
      content: body.content,
      patientName: body.patientName,
      consultationDate: body.consultationDate,
      clinicianName: body.clinicianName,
      clinicName: body.clinicName,
      medications: body.medications ?? [],
      followUpTasks: body.followUpTasks ?? [],
      referrals: body.referrals ?? [],
    }) as unknown as React.ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(documentElement);

    if (body.consultationId && body.noteId && profileId) {
      const { error: insertError } = await supabase
        .from('export_records')
        .insert({
          consultation_id: body.consultationId,
          note_id: body.noteId,
          format: 'pdf',
          file_path: null,
          exported_by: profileId,
        });
      if (insertError) {
        logError('export-pdf-audit', insertError);
      }
    }

    const slug = sanitizeFilename(body.patientName || 'clinical-note');
    const dateSlug = new Date().toISOString().split('T')[0];
    const filename = `clinical-note-${slug}-${dateSlug}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logError('export-pdf', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
