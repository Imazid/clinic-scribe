import { createClient } from '@/lib/supabase/client';

export async function uploadAudio(clinicId: string, consultationId: string, audioBlob: Blob, fileName: string) {
  const supabase = createClient();
  const path = `${clinicId}/${consultationId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('audio-recordings')
    .upload(path, audioBlob, { contentType: audioBlob.type, upsert: true });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase
    .from('audio_recordings')
    .insert({
      consultation_id: consultationId,
      storage_path: path,
      file_name: fileName,
      file_size: audioBlob.size,
      duration_seconds: 0,
      mime_type: audioBlob.type,
    });

  if (insertError) throw insertError;

  return path;
}

export async function getAudioUrl(path: string) {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from('audio-recordings')
    .createSignedUrl(path, 3600);
  return data?.signedUrl;
}
