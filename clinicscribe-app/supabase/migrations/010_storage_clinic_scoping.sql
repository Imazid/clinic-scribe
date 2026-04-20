-- ============================================================
-- 010 — Storage RLS: clinic-scoped audio access
-- ============================================================
-- Replaces the original "any authenticated user can read/write audio"
-- policies (migration 001) with clinic-scoped ones using the path
-- prefix convention: <clinic_id>/<consultation_id>/<filename>.
--
-- Without this fix, any authenticated clinician could enumerate or
-- read PHI audio belonging to any other clinic.
-- ============================================================

-- Drop the permissive policies from 001_initial_schema.sql
drop policy if exists "Authenticated users can upload audio" on storage.objects;
drop policy if exists "Authenticated users can read audio" on storage.objects;

-- Read: only members of the clinic that owns the first folder segment
create policy "Clinic members can read own audio"
  on storage.objects
  for select
  using (
    bucket_id = 'audio-recordings'
    and (
      select clinic_id::text
      from public.profiles
      where user_id = auth.uid()
    ) = (storage.foldername(name))[1]
  );

-- Insert: same clinic-prefix check on the uploaded path
create policy "Clinic members can upload own audio"
  on storage.objects
  for insert
  with check (
    bucket_id = 'audio-recordings'
    and (
      select clinic_id::text
      from public.profiles
      where user_id = auth.uid()
    ) = (storage.foldername(name))[1]
  );

-- Update: needed for upsert: true in audio.ts
create policy "Clinic members can update own audio"
  on storage.objects
  for update
  using (
    bucket_id = 'audio-recordings'
    and (
      select clinic_id::text
      from public.profiles
      where user_id = auth.uid()
    ) = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'audio-recordings'
    and (
      select clinic_id::text
      from public.profiles
      where user_id = auth.uid()
    ) = (storage.foldername(name))[1]
  );

-- Delete: clinic members can clear out their own recordings
create policy "Clinic members can delete own audio"
  on storage.objects
  for delete
  using (
    bucket_id = 'audio-recordings'
    and (
      select clinic_id::text
      from public.profiles
      where user_id = auth.uid()
    ) = (storage.foldername(name))[1]
  );
