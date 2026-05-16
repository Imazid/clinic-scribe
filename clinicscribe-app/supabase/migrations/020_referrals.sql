-- ============================================================
-- 020 — Referrals (Refer & earn)
-- ============================================================
-- Each clinician gets a permalink slug stored on their profile. When they
-- invite a colleague we record the invite in `referrals` with a hashed
-- token. The signup flow honours `?ref=TOKEN` by attaching it to user
-- metadata; an activation trigger (added in a future migration) flips
-- the status to `activated` and awards credits to both sides.
--
-- For now this migration only ships the schema + RLS so the /refer page
-- can read+write its own data. Credit accounting against Stripe is a
-- follow-up.

-- ─── profiles.referral_slug ──────────────────────────────────────────
-- Short human-friendly handle that appears in the share URL
-- (miraa.health/r/<slug>). Generated server-side on first refer-page
-- visit and never changes after that.
alter table public.profiles
  add column if not exists referral_slug text;

create unique index if not exists idx_profiles_referral_slug
  on public.profiles (referral_slug)
  where referral_slug is not null;

comment on column public.profiles.referral_slug is
  'Stable per-clinician handle used in /r/<slug> referral URLs. Generated on first visit to /refer.';

-- ─── referrals ────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id                  uuid primary key default uuid_generate_v4(),
  referrer_user_id    uuid not null references auth.users(id) on delete cascade,
  referrer_clinic_id  uuid not null references public.clinics(id) on delete cascade,
  invitee_email       text not null,
  invitee_user_id     uuid references auth.users(id) on delete set null,
  -- The plaintext token is in the share URL we email out. We keep both for
  -- a release window (lookup-by-token-hash is canonical; some legacy
  -- mailers may still embed the raw token).
  token               text not null,
  token_hash          text not null,
  status              text not null default 'invited'
                      check (status in ('invited', 'signed_up', 'activated', 'revoked', 'expired')),
  invited_at          timestamptz not null default now(),
  signed_up_at        timestamptz,
  activated_at        timestamptz,
  expires_at          timestamptz not null default (now() + interval '365 days'),
  message             text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists idx_referrals_token_hash
  on public.referrals (token_hash);

create index if not exists idx_referrals_referrer
  on public.referrals (referrer_user_id, invited_at desc);

create index if not exists idx_referrals_invitee_email
  on public.referrals (lower(invitee_email));

alter table public.referrals enable row level security;

-- Referrers see + manage their own referrals.
create policy "Referrers read own referrals"
  on public.referrals
  for select
  using (referrer_user_id = auth.uid());

create policy "Referrers insert own referrals"
  on public.referrals
  for insert
  with check (referrer_user_id = auth.uid());

create policy "Referrers update own referrals"
  on public.referrals
  for update
  using (referrer_user_id = auth.uid())
  with check (referrer_user_id = auth.uid());

-- DELETE is service-role only. Use status='revoked' from the UI.

-- updated_at auto-touch trigger.
create or replace function public.touch_referrals_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_referrals_updated_at on public.referrals;
create trigger trg_touch_referrals_updated_at
before update on public.referrals
for each row execute function public.touch_referrals_updated_at();

comment on table public.referrals is
  'Refer & earn invites: one row per (referrer, invitee_email). Lifecycle: invited → signed_up → activated. Both sides earn 3 months when activated_at is set.';
