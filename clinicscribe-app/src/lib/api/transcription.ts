export async function transcribeAudio(consultationId: string, audioBlob: Blob): Promise<{ text: string; segments: Array<{ start: number; end: number; text: string }> }> {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('consultationId', consultationId);

  const res = await fetch('/api/transcribe', { method: 'POST', body: formData });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Transcription failed');
  }

  return res.json();
}
