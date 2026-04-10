alter table public.visit_briefs
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

create index if not exists idx_visit_briefs_created_by
  on public.visit_briefs(created_by);

create index if not exists idx_visit_briefs_updated_by
  on public.visit_briefs(updated_by);
