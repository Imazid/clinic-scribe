-- ============================================================
-- 017 — Make PHI/non-repudiation records explicitly immutable
-- ============================================================
-- `audio_recordings`, `transcripts`, and `export_records` were left without
-- UPDATE / DELETE policies in 001. With RLS enabled, the absence of a
-- policy already denies those actions for clinic members — but we make
-- the lockdown explicit so a future relaxed table-level policy cannot
-- accidentally permit clinical-record tampering.
--
-- Service-role writes (e.g., GDPR purge jobs) bypass RLS as before.

create policy "Audio recordings are immutable (no update)"
  on public.audio_recordings
  for update using (false) with check (false);

create policy "Audio recordings are immutable (no delete)"
  on public.audio_recordings
  for delete using (false);

create policy "Transcripts are immutable (no update)"
  on public.transcripts
  for update using (false) with check (false);

create policy "Transcripts are immutable (no delete)"
  on public.transcripts
  for delete using (false);

create policy "Export records are immutable (no update)"
  on public.export_records
  for update using (false) with check (false);

create policy "Export records are immutable (no delete)"
  on public.export_records
  for delete using (false);

comment on policy "Audio recordings are immutable (no update)" on public.audio_recordings is
  'Non-repudiation: original consult audio cannot be rewritten by clinicians. Lifecycle/purge runs via service role only.';
comment on policy "Transcripts are immutable (no update)" on public.transcripts is
  'Non-repudiation: transcripts are the source-of-truth for any clinical-note dispute. Edits happen via clinical_notes only.';
comment on policy "Export records are immutable (no update)" on public.export_records is
  'Non-repudiation: a record that a PDF/CSV was exported cannot be silently retracted.';
