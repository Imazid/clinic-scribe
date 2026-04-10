create table if not exists public.evidence_queries (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  question text not null,
  scope text not null,
  linked_finding_code text,
  answer text not null default '',
  key_points jsonb not null default '[]',
  citations jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'accepted')),
  created_by uuid references public.profiles(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_evidence_queries_consultation
  on public.evidence_queries(consultation_id, created_at desc);

create index if not exists idx_evidence_queries_clinic
  on public.evidence_queries(clinic_id, created_at desc);

alter table public.evidence_queries enable row level security;

drop policy if exists "Clinic members can read evidence queries" on public.evidence_queries;
create policy "Clinic members can read evidence queries" on public.evidence_queries
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can write evidence queries" on public.evidence_queries;
create policy "Clinic members can write evidence queries" on public.evidence_queries
  for all using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );
