-- Marketing website waitlist signups
create table if not exists public.waitlist_signups (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text not null default '',
  role text not null default 'unknown',
  source text not null default 'website',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (email)
);

create index if not exists idx_waitlist_signups_created_at
  on public.waitlist_signups (created_at desc);

create index if not exists idx_waitlist_signups_source
  on public.waitlist_signups (source);

alter table public.waitlist_signups enable row level security;
