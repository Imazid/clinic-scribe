drop policy if exists "Clinic members can insert templates" on public.note_templates;
create policy "Clinic members can insert templates" on public.note_templates
  for insert with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can update templates" on public.note_templates;
create policy "Clinic members can update templates" on public.note_templates
  for update using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  )
  with check (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );

drop policy if exists "Clinic members can delete templates" on public.note_templates;
create policy "Clinic members can delete templates" on public.note_templates
  for delete using (
    clinic_id in (select clinic_id from public.profiles where user_id = auth.uid())
  );
