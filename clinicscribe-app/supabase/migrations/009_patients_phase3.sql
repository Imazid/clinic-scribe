-- Phase 3: Patient UX + new columns
-- Adds height, preferred provider, primary location, and a denormalised
-- last_appointment_at so the patient list / detail surfaces can answer
-- "when did we last see this patient" without scanning consultations.

alter table public.patients
  add column if not exists height_cm numeric(5,2),
  add column if not exists provider_name text,
  add column if not exists location text,
  add column if not exists last_appointment_at timestamptz;

create index if not exists idx_patients_provider
  on public.patients(clinic_id, provider_name)
  where provider_name is not null;

create index if not exists idx_patients_last_appointment
  on public.patients(clinic_id, last_appointment_at desc nulls last);

-- Backfill last_appointment_at from existing consultations so the column
-- is immediately useful after deploy. Uses started_at (source of truth),
-- falls back to created_at for older rows.
update public.patients p
set last_appointment_at = sub.latest
from (
  select patient_id, max(coalesce(started_at, created_at)) as latest
  from public.consultations
  group by patient_id
) sub
where sub.patient_id = p.id;
