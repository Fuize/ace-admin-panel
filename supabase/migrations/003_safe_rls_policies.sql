-- ACE Admin Panel safe read-only RLS policies for Supabase auth testing.
-- Draft only: review and apply manually in Supabase SQL Editor.

grant usage on schema public to authenticated;

grant select on table public.admins to authenticated;
grant select on table public.admin_roles to authenticated;
grant select on table public.admin_permissions to authenticated;
grant select on table public.role_permissions to authenticated;
grant select on table public.staff_chat_messages to authenticated;
grant select on table public.admin_presence to authenticated;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  );
$$;

comment on function public.is_active_admin() is 'Returns true when auth.uid() belongs to an active admin profile. Used by read-only RLS policies.';

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;

drop policy if exists "active admins can read own admin profile" on public.admins;
create policy "active admins can read own admin profile"
on public.admins
for select
to authenticated
using (auth_user_id = auth.uid() and is_active = true);

drop policy if exists "active admins can read active roles" on public.admin_roles;
create policy "active admins can read active roles"
on public.admin_roles
for select
to authenticated
using (is_active = true and public.is_active_admin());

drop policy if exists "active admins can read active permissions" on public.admin_permissions;
create policy "active admins can read active permissions"
on public.admin_permissions
for select
to authenticated
using (is_active = true and public.is_active_admin());

drop policy if exists "active admins can read role permissions" on public.role_permissions;
create policy "active admins can read role permissions"
on public.role_permissions
for select
to authenticated
using (public.is_active_admin());

drop policy if exists "active admins can read staff chat messages" on public.staff_chat_messages;
create policy "active admins can read staff chat messages"
on public.staff_chat_messages
for select
to authenticated
using (public.is_active_admin());

drop policy if exists "active admins can read admin presence" on public.admin_presence;
create policy "active admins can read admin presence"
on public.admin_presence
for select
to authenticated
using (public.is_active_admin());

-- No INSERT, UPDATE, or DELETE policies are added in this draft.
-- Presence writes, staff chat sends, admin management, and role management should be added later with explicit permission checks.
