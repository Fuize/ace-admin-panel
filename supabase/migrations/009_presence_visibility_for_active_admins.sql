-- ACE Admin Panel presence visibility fix.
-- Draft only: apply manually in Supabase SQL Editor after migrations 001, 003, 005, and 007.
-- Goal: every authenticated active admin can see who is online in the web panel.

grant select, insert, update on table public.admin_presence to authenticated;

drop policy if exists "active admins can read presence with permission" on public.admin_presence;
drop policy if exists "active admins can read all presence" on public.admin_presence;

create policy "active admins can read all presence"
on public.admin_presence
for select
to authenticated
using (public.is_active_admin());

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
