-- ============================================================
-- Hash invitation tokens at rest
-- ============================================================
-- The original `clinic_invitations.token` column stored a base64url
-- random secret in plaintext. A leak of the table (backup, log, replica
-- snapshot) would let an attacker accept any unaccepted invitation and
-- learn the invitee's email address.
--
-- We migrate to a `token_hash` column that stores SHA-256 of the URL
-- token. The plaintext token continues to live only in:
--   • the URL the inviter sends to the invitee
--   • application memory for the duration of one request
--
-- Backfill strategy:
--   1. Add token_hash nullable, populate from existing token via SHA-256
--   2. Make token_hash NOT NULL + unique
--   3. Drop the unique constraint on `token` and keep `token` for one
--      release window so a rollback is possible. A follow-up migration
--      can drop the column entirely once we're confident.

alter table public.clinic_invitations
  add column if not exists token_hash text;

-- Backfill existing rows. encode(digest(...)) requires pgcrypto.
create extension if not exists pgcrypto;

update public.clinic_invitations
set token_hash = encode(digest(token, 'sha256'), 'hex')
where token_hash is null;

alter table public.clinic_invitations
  alter column token_hash set not null;

-- Replace the plaintext-token uniqueness with hash uniqueness.
drop index if exists idx_invitations_token;
create unique index if not exists idx_invitations_token_hash
  on public.clinic_invitations(token_hash);

-- Remove the inline `unique` constraint that was created with the
-- column. Postgres autonames it `clinic_invitations_token_key`.
alter table public.clinic_invitations
  drop constraint if exists clinic_invitations_token_key;

comment on column public.clinic_invitations.token_hash is
  'SHA-256 hex of the URL token. The plaintext token is never stored at rest.';
comment on column public.clinic_invitations.token is
  'DEPRECATED. Will be dropped in a follow-up migration once all reads/writes have moved to token_hash.';
