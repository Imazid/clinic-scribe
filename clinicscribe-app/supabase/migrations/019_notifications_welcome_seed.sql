-- ============================================================
-- 019 — Welcome notifications seed
-- ============================================================
-- The notifications panel feels dead until something lands in it. We seed
-- three onboarding notifications on every profile insert via a SECURITY
-- DEFINER trigger (so it works regardless of the role doing the insert)
-- and backfill the same three for any existing profile that hasn't
-- received anything yet.
--
-- Idempotency:
--   - Trigger fires once per profile insert; new sign-ups always get
--     three rows. If a profile is deleted and recreated they'd get them
--     again, which is fine — that's a re-onboarding event.
--   - Backfill skips profiles that already have ≥1 notification.

create or replace function public.notifications_welcome_seed()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.notifications (clinic_id, user_id, kind, title, body, link, cta_label) values
    (new.clinic_id, new.user_id, 'info',
      'Welcome to Miraa',
      'Press ⌘K to find anything. Press ? for the keyboard cheat sheet. We''re glad you''re here.',
      '/help',
      'Read the guide'),
    (new.clinic_id, new.user_id, 'success',
      'Your workspace is ready',
      'Start a consultation when you''re ready — Miraa drafts the note while you focus on the patient.',
      '/consultations/new',
      'Start a consultation'),
    (new.clinic_id, new.user_id, 'info',
      'Refer a colleague — get 3 months free',
      'Both you and the clinician you invite get three months on us. No cap.',
      '/refer',
      'View your link');
  return new;
end;
$$;

drop trigger if exists trg_notifications_welcome_seed on public.profiles;
create trigger trg_notifications_welcome_seed
after insert on public.profiles
for each row execute function public.notifications_welcome_seed();

-- Backfill: every existing profile without any notification rows.
do $$
declare
  prof record;
begin
  for prof in
    select p.user_id, p.clinic_id from public.profiles p
    where not exists (
      select 1 from public.notifications n where n.user_id = p.user_id
    )
  loop
    insert into public.notifications (clinic_id, user_id, kind, title, body, link, cta_label) values
      (prof.clinic_id, prof.user_id, 'info',
        'Welcome to Miraa',
        'Press ⌘K to find anything. Press ? for the keyboard cheat sheet. We''re glad you''re here.',
        '/help',
        'Read the guide'),
      (prof.clinic_id, prof.user_id, 'success',
        'Your workspace is ready',
        'Start a consultation when you''re ready — Miraa drafts the note while you focus on the patient.',
        '/consultations/new',
        'Start a consultation'),
      (prof.clinic_id, prof.user_id, 'info',
        'Refer a colleague — get 3 months free',
        'Both you and the clinician you invite get three months on us. No cap.',
        '/refer',
        'View your link');
  end loop;
end $$;

comment on function public.notifications_welcome_seed() is
  'Inserts three onboarding notifications when a new profile is created. SECURITY DEFINER so the trigger writes regardless of the role doing the insert.';
