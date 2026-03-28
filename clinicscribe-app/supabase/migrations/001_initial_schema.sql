-- ClinicScribe AI — Initial Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/yrczfezcexyowtjoiwhw/sql)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CLINICS
-- ============================================================
create table public.clinics (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  subscription_tier text not null default 'solo' check (subscription_tier in ('solo', 'clinic', 'group', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  role text not null default 'clinician' check (role in ('admin', 'clinician', 'receptionist')),
  first_name text not null default '',
  last_name text not null default '',
  specialty text,
  provider_number text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- ============================================================
-- PATIENTS
-- ============================================================
create table public.patients (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  sex text not null default 'other' check (sex in ('male', 'female', 'other')),
  email text,
  phone text,
  mrn text,
  medicare_number text,
  ihi text,
  allergies text[] not null default '{}',
  conditions text[] not null default '{}',
  consent_status text not null default 'pending' check (consent_status in ('granted', 'revoked', 'pending')),
  consent_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_patients_clinic on public.patients(clinic_id);
create index idx_patients_name on public.patients(clinic_id, last_name, first_name);

-- ============================================================
-- CONSULTATIONS
-- ============================================================
create table public.consultations (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinician_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'recording' check (status in ('recording', 'transcribing', 'generating', 'review_pending', 'approved', 'exported')),
  consultation_type text not null default 'Standard Consultation',
  duration_seconds integer,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_consultations_clinic on public.consultations(clinic_id);
create index idx_consultations_patient on public.consultations(patient_id);
create index idx_consultations_clinician on public.consultations(clinician_id);
create index idx_consultations_status on public.consultations(clinic_id, status);

-- ============================================================
-- AUDIO RECORDINGS
-- ============================================================
create table public.audio_recordings (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint not null default 0,
  duration_seconds integer not null default 0,
  mime_type text not null default 'audio/webm',
  created_at timestamptz not null default now()
);

create index idx_audio_consultation on public.audio_recordings(consultation_id);

-- ============================================================
-- TRANSCRIPTS
-- ============================================================
create table public.transcripts (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  full_text text not null default '',
  segments jsonb not null default '[]',
  language text not null default 'en',
  model text not null default 'whisper-1',
  created_at timestamptz not null default now()
);

create index idx_transcripts_consultation on public.transcripts(consultation_id);

-- ============================================================
-- CLINICAL NOTES
-- ============================================================
create table public.clinical_notes (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  version integer not null default 1,
  format text not null default 'soap' check (format in ('soap', 'progress', 'visit_summary')),
  content jsonb not null default '{}',
  confidence_scores jsonb not null default '{}',
  medications jsonb not null default '[]',
  follow_up_tasks jsonb not null default '[]',
  referrals jsonb not null default '[]',
  ai_model text not null default '',
  ai_prompt_version text not null default '',
  is_approved boolean not null default false,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_consultation on public.clinical_notes(consultation_id);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}',
  ip_address text,
  created_at timestamptz not null default now()
);

create index idx_audit_clinic on public.audit_logs(clinic_id);
create index idx_audit_created on public.audit_logs(created_at desc);

-- ============================================================
-- NOTE TEMPLATES
-- ============================================================
create table public.note_templates (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  format text not null default 'soap',
  system_prompt_override text,
  sections text[] not null default '{"subjective","objective","assessment","plan"}',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EXPORT RECORDS
-- ============================================================
create table public.export_records (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  note_id uuid not null references public.clinical_notes(id) on delete cascade,
  format text not null default 'pdf' check (format in ('pdf', 'clipboard')),
  file_path text,
  exported_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.consultations enable row level security;
alter table public.audio_recordings enable row level security;
alter table public.transcripts enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.audit_logs enable row level security;
alter table public.note_templates enable row level security;
alter table public.export_records enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Clinic members can read their clinic
create policy "Clinic members can read clinic" on public.clinics
  for select using (
    id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

-- Clinic-scoped read/write for all clinical data
create policy "Clinic members can read patients" on public.patients
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can insert patients" on public.patients
  for insert with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can update patients" on public.patients
  for update using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can read consultations" on public.consultations
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can insert consultations" on public.consultations
  for insert with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can update consultations" on public.consultations
  for update using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can read audio" on public.audio_recordings
  for select using (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can insert audio" on public.audio_recordings
  for insert with check (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can read transcripts" on public.transcripts
  for select using (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can insert transcripts" on public.transcripts
  for insert with check (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can read notes" on public.clinical_notes
  for select using (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can insert notes" on public.clinical_notes
  for insert with check (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can update notes" on public.clinical_notes
  for update using (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can read audit logs" on public.audit_logs
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can insert audit logs" on public.audit_logs
  for insert with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can read templates" on public.note_templates
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

create policy "Clinic members can read exports" on public.export_records
  for select using (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Clinic members can insert exports" on public.export_records
  for insert with check (
    consultation_id in (
      select id from public.consultations
      where clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
    )
  );

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('audio-recordings', 'audio-recordings', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload audio" on storage.objects
  for insert with check (bucket_id = 'audio-recordings' and auth.role() = 'authenticated');

create policy "Authenticated users can read audio" on storage.objects
  for select using (bucket_id = 'audio-recordings' and auth.role() = 'authenticated');

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_clinic_id uuid;
begin
  -- Create a default clinic for the user
  insert into public.clinics (name, email)
  values (
    coalesce(
      new.raw_user_meta_data->>'clinic_name',
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Clinic'
    ),
    new.email
  )
  returning id into new_clinic_id;

  -- Create the profile
  insert into public.profiles (user_id, clinic_id, role, first_name, last_name)
  values (
    new.id,
    new_clinic_id,
    'admin',
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
