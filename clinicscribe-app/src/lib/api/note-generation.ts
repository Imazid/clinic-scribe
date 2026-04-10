import type { TemplateCatalogItem } from '@/lib/types';

export async function generateNote(
  consultationId: string,
  transcript: string,
  patientContext?: string,
  templateKey?: string | null,
  template?: TemplateCatalogItem | null
) {
  const res = await fetch(`/api/consultations/${consultationId}/note/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, patientContext, templateKey, template }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Note generation failed');
  }

  return res.json();
}
