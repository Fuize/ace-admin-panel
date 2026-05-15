-- ACE Admin Panel auth_email support for clean username login.
-- Draft only: review and apply manually in Supabase SQL Editor.

alter table public.admins
add column if not exists auth_email text;

comment on column public.admins.auth_email is 'Internal Supabase Auth email for password sign-in. Never show this in the admin panel UI.';

create unique index if not exists admins_auth_email_unique_idx
on public.admins (lower(auth_email))
where auth_email is not null;

-- Existing projects must fill auth_email for every admin before this migration can enforce NOT NULL.
-- Example before rerunning this file:
-- update public.admins
-- set auth_email = 'real-auth-email@example.com'
-- where username = 'admin_username';
do $$
begin
  if exists (select 1 from public.admins where auth_email is null) then
    raise exception 'Fill public.admins.auth_email for every existing admin before enforcing NOT NULL.';
  end if;
end $$;

alter table public.admins
alter column auth_email set not null;

create or replace function public.lookup_admin_auth_email(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select a.auth_email
  from public.admins a
  join public.admin_roles r on r.id = a.role_id
  where lower(a.username) = lower(trim(p_username))
    and a.is_active = true
    and r.is_active = true
  limit 1;
$$;

comment on function public.lookup_admin_auth_email(text) is 'Returns the internal auth_email for an active approved admin username. Intended for the server-side username login route only.';

revoke all on function public.lookup_admin_auth_email(text) from public;
grant execute on function public.lookup_admin_auth_email(text) to anon, authenticated;
