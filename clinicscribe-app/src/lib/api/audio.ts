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
    // 5-minute TTL — long enough for the review UI to fetch the recording,
    // short enough that a stray browser-history entry or a shoulder-surfed
    // link can't be replayed against PHI later.
    .createSignedUrl(path, 5 * 60);
  return data?.signedUrl;
}
