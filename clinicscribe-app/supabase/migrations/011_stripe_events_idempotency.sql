-- ============================================================
-- 011 — Stripe webhook idempotency
-- ============================================================
-- Stripe retries events on 5xx, which can cause duplicate side-effects
-- (subscription tier flipped twice, seats reset, etc.). We record every
-- event_id we've processed; duplicate deliveries short-circuit.
-- ============================================================

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- Writes go through the service-role key in the webhook route, so we do
-- not need broad RLS policies for the anon/authenticated roles. Enable
-- RLS anyway and create no policies — locked down by default.
alter table public.stripe_events enable row level security;

-- Housekeeping index: let us prune old rows by type and age.
create index if not exists idx_stripe_events_processed_at
  on public.stripe_events (processed_at desc);
