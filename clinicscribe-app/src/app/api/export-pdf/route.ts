import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { ClinicalNoteDocument } from '@/lib/pdf/ClinicalNoteDocument';
import { createClient } from '@/lib/supabase/server';
import type { FollowUpTask, MedicationDraft, SOAPNote } from '@/lib/types';

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
  try {
    const body = (await request.json()) as ExportPdfPayload;

    if (!body?.content || !body.patientName) {
      return NextResponse.json(
        { error: 'content and patientName are required' },
        { status: 400 }
      );
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

    // Best-effort audit log — never fail the download on logging errors.
    if (body.consultationId && body.noteId) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let profileId: string | null = null;
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          profileId = profile?.id ?? null;
        }

        if (profileId) {
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
            console.warn('export_records insert failed:', insertError.message);
          }
        }
      } catch (logError) {
        console.warn('export_records audit log skipped:', logError);
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
    console.error('PDF export error:', error);
    const message = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
