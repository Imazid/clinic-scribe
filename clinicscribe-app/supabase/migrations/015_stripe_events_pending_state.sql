-- ============================================================
-- 015 — Stripe events: pending-vs-processed state
-- ============================================================
-- The original idempotency table marked an event as `processed_at = now()`
-- on insert, then deleted the row on dispatch failure to allow Stripe to
-- retry. That rollback is unsafe: any DB writes that succeeded before the
-- throw are NOT undone, so the retry re-applies them on top of partial
-- state.
--
-- New contract:
--   1. Insert with `processed_at = NULL` to *claim* the event.
--   2. Run side effects (all our handlers are idempotent UPDATEs).
--   3. UPDATE `processed_at = now()` on success.
--   4. On error, leave `processed_at` NULL and write `last_error`.
--      Operator can inspect, fix, and (if needed) delete the row to
--      let Stripe's next retry through.

alter table public.stripe_events
  alter column processed_at drop not null,
  alter column processed_at drop default;

alter table public.stripe_events
  add column if not exists claimed_at timestamptz not null default now(),
  add column if not exists last_error text;

-- Operators look at the unprocessed list to find stuck deliveries.
create index if not exists idx_stripe_events_pending
  on public.stripe_events (claimed_at)
  where processed_at is null;

comment on column public.stripe_events.processed_at is
  'Set when the side-effects for this event have committed successfully. NULL means the event was claimed but the handler errored or is still in-flight.';
comment on column public.stripe_events.claimed_at is
  'When the webhook handler first inserted the row. Used to find stuck deliveries (claimed but never processed).';
comment on column public.stripe_events.last_error is
  'Most recent dispatch error. Operator-facing only — never expose to clients.';
