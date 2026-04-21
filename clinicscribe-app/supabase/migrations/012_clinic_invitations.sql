-- ============================================================
-- 012 — Clinic invitations (M1 from security audit)
-- ============================================================
-- Without this, every signup creates a new clinic (see
-- handle_new_user in 001). A 5-doctor practice ends up as 5
-- isolated clinics. This adds a token-based invite flow so
-- existing clinics can pull new clinicians into their tenant.
-- ============================================================

create table public.clinic_invitations (
  id uuid primary key default uuid_generate_v4(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  email text not null,
  role text not null default 'clinician'
    check (role in ('admin', 'clinician', 'receptionist')),
  token text not null unique,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_invitations_clinic on public.clinic_invitations(clinic_id);
create index idx_invitations_email on public.clinic_invitations(lower(email));
create unique index idx_invitations_token on public.clinic_invitations(token);

-- Partial unique: only one active outstanding invite per (clinic, email).
create unique index idx_invitations_active
  on public.clinic_invitations(clinic_id, lower(email))
  where accepted_at is null and revoked_at is null;

alter table public.clinic_invitations enable row level security;

-- Admins of a clinic can manage invitations for that clinic.
create policy "Clinic admins can read invitations"
  on public.clinic_invitations for select
  using (
    clinic_id in (
      select clinic_id from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Clinic admins can create invitations"
  on public.clinic_invitations for insert
  with check (
    clinic_id in (
      select clinic_id from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
    and invited_by in (
      select id from public.profiles where user_id = auth.uid()
    )
  );

create policy "Clinic admins can revoke invitations"
  on public.clinic_invitations for update
  using (
    clinic_id in (
      select clinic_id from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    clinic_id in (
      select clinic_id from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- Update handle_new_user trigger to honor invite tokens.
-- If raw_user_meta_data->>'invite_token' is present and valid,
-- attach the new user to that clinic. Otherwise fall back to
-- creating a new clinic (preserves existing solo signup flow).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_clinic_id uuid;
  new_role text := 'admin';
  invite_token text;
  invite_record public.clinic_invitations%rowtype;
  new_profile_id uuid;
begin
  invite_token := new.raw_user_meta_data->>'invite_token';

  if invite_token is not null and length(invite_token) > 0 then
    select * into invite_record
    from public.clinic_invitations
    where token = invite_token
      and accepted_at is null
      and revoked_at is null
      and expires_at > now()
      and lower(email) = lower(new.email);

    if found then
      new_clinic_id := invite_record.clinic_id;
      new_role := invite_record.role;
    end if;
  end if;

  if new_clinic_id is null then
    -- No valid invite — original behaviour: create a new clinic.
    insert into public.clinics (name, email)
    values (
      coalesce(
        new.raw_user_meta_data->>'clinic_name',
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Clinic'
      ),
      new.email
    )
    returning id into new_clinic_id;
  end if;

  insert into public.profiles (user_id, clinic_id, role, first_name, last_name)
  values (
    new.id,
    new_clinic_id,
    new_role,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  returning id into new_profile_id;

  -- Mark invite accepted (if any)
  if invite_record.id is not null then
    update public.clinic_invitations
    set accepted_at = now(), accepted_by = new_profile_id
    where id = invite_record.id;
  end if;

  return new;
end;
$$ language plpgsql security definer;
