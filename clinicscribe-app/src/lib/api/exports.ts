import type { FollowUpTask, MedicationDraft, SOAPNote } from '@/lib/types';

export interface ExportNotePDFInput {
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
    .toLowerCase() || 'clinical-note';
}

export async function exportNotePDF(input: ExportNotePDFInput) {
  const res = await fetch('/api/export-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let message = 'Export failed';
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // fall through with default message
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clinical-note-${sanitizeFilename(input.patientName)}-${new Date()
    .toISOString()
    .split('T')[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyNoteToClipboard(content: SOAPNote): Promise<void> {
  const text = `SUBJECTIVE:\n${content.subjective}\n\nOBJECTIVE:\n${content.objective}\n\nASSESSMENT:\n${content.assessment}\n\nPLAN:\n${content.plan}`;
  return navigator.clipboard.writeText(text);
}
