-- ============================================================
-- 016 — Tamper-proof audit_logs
-- ============================================================
-- The original migration created SELECT and INSERT policies for
-- `audit_logs` but left UPDATE and DELETE silently allowed via the
-- absence of a policy + the default-deny RLS posture. With RLS enabled
-- and no policy for an action, that action is denied — but Supabase's
-- default policy generators have flipped on this in the past, and
-- HIPAA-style audit trails should make the lockdown explicit.
--
-- We add explicit "always false" UPDATE and DELETE policies so even a
-- future relaxed policy at the table level can't accidentally permit
-- mutation. Backend / dashboard SELECT continues to work as before.

create policy "Audit logs are immutable (no update)"
  on public.audit_logs
  for update
  using (false)
  with check (false);

create policy "Audit logs are immutable (no delete)"
  on public.audit_logs
  for delete
  using (false);

comment on policy "Audit logs are immutable (no update)" on public.audit_logs is
  'Non-repudiation: clinicians cannot edit audit log entries after the fact. Rotation/expiry must be done via service-role with explicit operator action.';
comment on policy "Audit logs are immutable (no delete)" on public.audit_logs is
  'Non-repudiation: clinicians cannot delete audit log entries. See above.';
