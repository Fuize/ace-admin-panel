-- ACE Admin Panel admin display fields adjustment.
-- Draft only: do not run or apply automatically.

alter table public.admins
  add column if not exists staff_id text,
  add column if not exists display_lastname text not null default '';

create unique index if not exists admins_staff_id_unique_idx
on public.admins(staff_id)
where staff_id is not null;

comment on column public.admins.username is 'Internal/login identity. Do not show as the public admin display name in the panel.';
comment on column public.admins.auth_user_id is 'References auth.users.id. Supabase Auth stores passwords; this table stores profile data only.';
comment on column public.admins.staff_id is 'Visible admin/staff ID shown in the panel. Unique when set.';
comment on column public.admins.display_name is 'Visible first/name display value shown in the panel.';
comment on column public.admins.display_lastname is 'Visible last-name display value shown in the panel.';
comment on column public.admins.role_id is 'References admin_roles. Visible rank name and color should come from the related role.';
