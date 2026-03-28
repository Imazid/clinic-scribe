import type { SOAPNote } from '@/lib/types';

export async function exportNotePDF(content: SOAPNote, patientName: string, consultationDate: string, clinicianName: string) {
  const res = await fetch('/api/export-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, patientName, consultationDate, clinicianName }),
  });

  if (!res.ok) throw new Error('Export failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clinical-note-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyNoteToClipboard(content: SOAPNote): Promise<void> {
  const text = `SUBJECTIVE:\n${content.subjective}\n\nOBJECTIVE:\n${content.objective}\n\nASSESSMENT:\n${content.assessment}\n\nPLAN:\n${content.plan}`;
  return navigator.clipboard.writeText(text);
}
