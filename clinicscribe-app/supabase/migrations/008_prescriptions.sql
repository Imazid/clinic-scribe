-- ============================================================
-- 008_prescriptions.sql
-- Prescription drafting flow: draft → approved → printed.
-- Items live as JSONB so PrescriptionItem can evolve without
-- another migration; strict shape is enforced in application code.
-- ============================================================

create table if not exists public.prescriptions (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  consultation_id uuid references public.consultations(id) on delete set null,
  clinical_note_id uuid references public.clinical_notes(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'printed', 'dispensed', 'void')),
  items jsonb not null default '[]'::jsonb,
  notes text,
  drafted_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prescriptions_clinic_created
  on public.prescriptions(clinic_id, created_at desc);
create index if not exists idx_prescriptions_consultation
  on public.prescriptions(consultation_id);
create index if not exists idx_prescriptions_patient
  on public.prescriptions(patient_id);
create index if not exists idx_prescriptions_status
  on public.prescriptions(clinic_id, status);

alter table public.prescriptions enable row level security;

drop policy if exists "Clinic members can read prescriptions" on public.prescriptions;
create policy "Clinic members can read prescriptions" on public.prescriptions
  for select using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can write prescriptions" on public.prescriptions;
create policy "Clinic members can write prescriptions" on public.prescriptions
  for all using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );
