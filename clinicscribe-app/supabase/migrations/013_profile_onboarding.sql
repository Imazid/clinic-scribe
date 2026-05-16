-- ============================================================
-- Profile onboarding state
-- ============================================================
-- First-run onboarding gate: when a user logs in for the first time
-- after confirming their email, we route them through `/onboarding`.
-- The onboarding wizard sets `onboarding_completed_at` on the final
-- step, after which subsequent logins go straight to `/dashboard`.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.profiles.onboarding_completed_at is
  'Set when the clinician finishes the post-signup onboarding wizard. NULL means onboarding is still required and the login flow will route them to /onboarding.';
