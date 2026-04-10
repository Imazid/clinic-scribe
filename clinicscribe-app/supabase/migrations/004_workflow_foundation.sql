-- Workflow copilot foundation

alter table public.consultations
  add column if not exists scheduled_for timestamptz,
  add column if not exists reason_for_visit text not null default '',
  add column if not exists source text not null default 'manual';

alter table public.consultations
  drop constraint if exists consultations_status_check;

alter table public.consultations
  add constraint consultations_status_check
  check (
    status in (
      'scheduled',
      'brief_ready',
      'recording',
      'transcribing',
      'generating',
      'review_pending',
      'approved',
      'closeout_pending',
      'closed',
      'exported'
    )
  );

alter table public.clinical_notes
  add column if not exists provenance_map jsonb not null default '[]',
  add column if not exists qa_findings jsonb not null default '[]',
  add column if not exists verification_status text not null default 'pending',
  add column if not exists patient_summary_snapshot jsonb not null default '{}';

create table if not exists public.visit_briefs (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_id uuid not null unique references public.consultations(id) on delete cascade,
  status text not null default 'ready' check (status in ('draft', 'ready', 'stale')),
  summary text not null default '',
  active_problems jsonb not null default '[]',
  medication_changes jsonb not null default '[]',
  abnormal_results jsonb not null default '[]',
  unresolved_items jsonb not null default '[]',
  likely_agenda jsonb not null default '[]',
  clarification_questions jsonb not null default '[]',
  source_context jsonb not null default '{}',
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_visit_briefs_clinic on public.visit_briefs(clinic_id);
create index if not exists idx_visit_briefs_patient on public.visit_briefs(patient_id);
create index if not exists idx_visit_briefs_generated_at on public.visit_briefs(generated_at desc);

create table if not exists public.care_tasks (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  note_id uuid references public.clinical_notes(id) on delete set null,
  title text not null,
  description text not null default '',
  due_at timestamptz,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  category text not null default 'follow_up',
  owner_user_id uuid references public.profiles(id) on delete set null,
  source text not null default 'note_plan',
  metadata jsonb not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_care_tasks_clinic_status on public.care_tasks(clinic_id, status);
create index if not exists idx_care_tasks_consultation on public.care_tasks(consultation_id);
create index if not exists idx_care_tasks_patient on public.care_tasks(patient_id);

create table if not exists public.generated_documents (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  note_id uuid references public.clinical_notes(id) on delete set null,
  kind text not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'sent')),
  content text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_generated_documents_consultation on public.generated_documents(consultation_id);
create index if not exists idx_generated_documents_kind on public.generated_documents(kind);

create table if not exists public.patient_timeline_events (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_id uuid references public.consultations(id) on delete set null,
  event_type text not null,
  title text not null,
  summary text not null default '',
  event_date timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_timeline_patient_date
  on public.patient_timeline_events(patient_id, event_date desc);

create table if not exists public.note_template_versions (
  id uuid primary key default uuid_generate_v4(),
  note_template_id uuid not null references public.note_templates(id) on delete cascade,
  version integer not null,
  name text not null,
  config jsonb not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(note_template_id, version)
);

create index if not exists idx_note_template_versions_template
  on public.note_template_versions(note_template_id, version desc);

alter table public.visit_briefs enable row level security;
alter table public.care_tasks enable row level security;
alter table public.generated_documents enable row level security;
alter table public.patient_timeline_events enable row level security;
alter table public.note_template_versions enable row level security;

drop policy if exists "Clinic members can read briefs" on public.visit_briefs;
create policy "Clinic members can read briefs" on public.visit_briefs
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can write briefs" on public.visit_briefs;
create policy "Clinic members can write briefs" on public.visit_briefs
  for all using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can read care tasks" on public.care_tasks;
create policy "Clinic members can read care tasks" on public.care_tasks
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can write care tasks" on public.care_tasks;
create policy "Clinic members can write care tasks" on public.care_tasks
  for all using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can read generated docs" on public.generated_documents;
create policy "Clinic members can read generated docs" on public.generated_documents
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can write generated docs" on public.generated_documents;
create policy "Clinic members can write generated docs" on public.generated_documents
  for all using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can read timeline events" on public.patient_timeline_events;
create policy "Clinic members can read timeline events" on public.patient_timeline_events
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can write timeline events" on public.patient_timeline_events;
create policy "Clinic members can write timeline events" on public.patient_timeline_events
  for all using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can read template versions" on public.note_template_versions;
create policy "Clinic members can read template versions" on public.note_template_versions
  for select using (
    note_template_id in (
      select id from public.note_templates
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

drop policy if exists "Clinic members can write template versions" on public.note_template_versions;
create policy "Clinic members can write template versions" on public.note_template_versions
  for all using (
    note_template_id in (
      select id from public.note_templates
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  )
  with check (
    note_template_id in (
      select id from public.note_templates
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );
