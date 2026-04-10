alter table public.consultations
  add column if not exists template_key text;

create index if not exists idx_consultations_template_key
  on public.consultations(template_key);

alter table public.clinical_notes
  add column if not exists template_key text;

create index if not exists idx_clinical_notes_template_key
  on public.clinical_notes(template_key);

alter table public.note_templates
  add column if not exists key text,
  add column if not exists category text not null default 'clinical_note',
  add column if not exists output_kind text not null default 'note',
  add column if not exists specialty text,
  add column if not exists description text,
  add column if not exists prompt_instructions text,
  add column if not exists structure jsonb not null default '[]'::jsonb,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_system boolean not null default false;

create index if not exists idx_note_templates_catalog
  on public.note_templates(clinic_id, sort_order, name);

alter table public.note_templates
  drop constraint if exists note_templates_category_check;

alter table public.note_templates
  add constraint note_templates_category_check
  check (category in (
    'clinical_note',
    'clinic_letter',
    'referral_letter',
    'patient_communication',
    'meeting_note',
    'certificate',
    'form',
    'care_planning'
  ));

alter table public.note_templates
  drop constraint if exists note_templates_output_kind_check;

alter table public.note_templates
  add constraint note_templates_output_kind_check
  check (output_kind in (
    'note',
    'letter',
    'meeting',
    'certificate',
    'form',
    'patient_summary',
    'goals'
  ));
