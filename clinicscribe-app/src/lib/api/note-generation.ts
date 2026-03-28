export async function generateNote(consultationId: string, transcript: string, patientContext?: string) {
  const res = await fetch('/api/generate-note', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consultationId, transcript, patientContext }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Note generation failed');
  }

  return res.json();
}
