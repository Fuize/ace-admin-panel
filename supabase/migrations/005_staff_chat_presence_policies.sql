-- ACE Admin Panel staff chat and presence RLS policies.
-- Draft only: review and apply manually in Supabase SQL Editor.

grant select on table public.admins to authenticated;
grant select on table public.admin_roles to authenticated;
grant select, insert on table public.staff_chat_messages to authenticated;
grant select, insert, update on table public.admin_presence to authenticated;

create or replace function public.current_admin_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.id
  from public.admins a
  where a.auth_user_id = auth.uid()
    and a.is_active = true
  limit 1;
$$;

create or replace function public.admin_has_permission(p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    join public.role_permissions rp on rp.role_id = a.role_id
    join public.admin_permissions p on p.id = rp.permission_id
    where a.auth_user_id = auth.uid()
      and a.is_active = true
      and p.key = p_permission_key
      and p.is_active = true
  );
$$;

comment on function public.current_admin_id() is 'Returns the active admin profile id for auth.uid().';
comment on function public.admin_has_permission(text) is 'Checks active admin role permissions for the current Supabase Auth user.';

revoke all on function public.current_admin_id() from public;
revoke all on function public.admin_has_permission(text) from public;
grant execute on function public.current_admin_id() to authenticated;
grant execute on function public.admin_has_permission(text) to authenticated;

drop policy if exists "active admins can read active admin display profiles" on public.admins;
create policy "active admins can read active admin display profiles"
on public.admins
for select
to authenticated
using (is_active = true and public.is_active_admin());

drop policy if exists "staff chat viewers can read messages" on public.staff_chat_messages;
create policy "staff chat viewers can read messages"
on public.staff_chat_messages
for select
to authenticated
using (
  is_deleted = false
  and public.is_active_admin()
  and public.admin_has_permission('staff_chat.view')
);

drop policy if exists "staff chat senders can insert own messages" on public.staff_chat_messages;
create policy "staff chat senders can insert own messages"
on public.staff_chat_messages
for insert
to authenticated
with check (
  sender_admin_id = public.current_admin_id()
  and is_deleted = false
  and deleted_by is null
  and deleted_at is null
  and public.is_active_admin()
  and public.admin_has_permission('staff_chat.send')
);

drop policy if exists "active admins can read presence with permission" on public.admin_presence;
create policy "active admins can read presence with permission"
on public.admin_presence
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('staff_chat.view')
);

drop policy if exists "active admins can insert own presence" on public.admin_presence;
create policy "active admins can insert own presence"
on public.admin_presence
for insert
to authenticated
with check (
  admin_id = public.current_admin_id()
  and public.is_active_admin()
);

drop policy if exists "active admins can update own presence" on public.admin_presence;
create policy "active admins can update own presence"
on public.admin_presence
for update
to authenticated
using (
  admin_id = public.current_admin_id()
  and public.is_active_admin()
)
with check (
  admin_id = public.current_admin_id()
  and public.is_active_admin()
);

-- No delete/edit chat policies are added.
-- No public anon policies are added.
