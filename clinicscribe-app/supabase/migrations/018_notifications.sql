-- ============================================================
-- 018 — Notifications
-- ============================================================
-- Per-user inbox of system events. Designed for the header bell + slide-out
-- panel. Notifications are scoped per-clinic so cross-clinic leaks are
-- impossible via RLS, but each individual notification is also keyed to
-- a single recipient `user_id` (denormalised for RLS speed).
--
-- Kinds we expect to surface:
--   critical  — QA flag the clinician must resolve before sign-off
--   success   — note synced to EMR, prescription printed, etc.
--   info      — referral credited, patient summary delivered
--   system    — sync restored, AI safety policy update, maintenance
--
-- `link` is an opt-in relative URL (e.g. /consultations/abc/review) that
-- the panel uses for its "Open" CTA. Keep it server-validated at write
-- time — the panel just navigates to it.

create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('critical', 'success', 'info', 'system')),
  title       text not null,
  body        text,
  link        text,
  cta_label   text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id, created_at desc)
  where is_read = false;

create index if not exists idx_notifications_user_recent
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Recipients can read their own notifications.
create policy "Users can read their notifications"
  on public.notifications
  for select
  using (user_id = auth.uid());

-- Recipients can mark their own notifications as read (UPDATE only allowed
-- if the new is_read = true, so users can't un-read someone else's row).
create policy "Users can mark their notifications read"
  on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Service-role writes only. No INSERT/DELETE policies = client cannot write
-- arbitrary notifications. The server route in `/api/notifications` uses
-- the user-scoped client to mark-read but the service role to enqueue.

comment on table public.notifications is
  'Per-user notification inbox surfaced in the header bell. Service-role writes only; users can read + mark-read their own rows.';
comment on column public.notifications.link is
  'Relative URL (must start with "/") used by the panel CTA. Validate at write time.';
