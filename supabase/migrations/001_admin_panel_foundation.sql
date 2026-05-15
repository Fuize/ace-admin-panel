-- ACE Admin Panel Supabase foundation draft.
-- Draft only: do not run or apply until the Supabase migration phase is approved.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  rank_level integer not null unique,
  color text not null default '#A1A1AA',
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  username text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null,
  role_id uuid references public.admin_roles(id) on delete set null,
  rank_color text,
  is_active boolean not null default true,
  is_online boolean not null default false,
  last_seen timestamptz,
  created_by uuid references public.admins(id) on delete set null,
  updated_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  category text not null default 'general',
  is_dangerous boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.admin_roles(id) on delete cascade,
  permission_id uuid not null references public.admin_permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

create table if not exists public.staff_chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_admin_id uuid references public.admins(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  is_deleted boolean not null default false,
  deleted_by uuid references public.admins(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_presence (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins(id) on delete cascade,
  session_id uuid not null,
  status text not null default 'online' check (status in ('online', 'idle', 'offline')),
  current_page text,
  last_heartbeat timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (admin_id, session_id)
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  user_agent text,
  ip_hash text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_seen timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_admin_id uuid references public.admins(id) on delete set null,
  actor_auth_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  severity text not null default 'info' check (severity in ('debug', 'info', 'warning', 'danger')),
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

drop trigger if exists set_admin_roles_updated_at on public.admin_roles;
create trigger set_admin_roles_updated_at
before update on public.admin_roles
for each row execute function public.set_updated_at();

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
before update on public.admins
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_permissions_updated_at on public.admin_permissions;
create trigger set_admin_permissions_updated_at
before update on public.admin_permissions
for each row execute function public.set_updated_at();

drop trigger if exists set_staff_chat_messages_updated_at on public.staff_chat_messages;
create trigger set_staff_chat_messages_updated_at
before update on public.staff_chat_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_presence_updated_at on public.admin_presence;
create trigger set_admin_presence_updated_at
before update on public.admin_presence
for each row execute function public.set_updated_at();

create index if not exists admin_roles_rank_level_idx on public.admin_roles(rank_level);
create index if not exists admin_roles_is_active_idx on public.admin_roles(is_active);

create index if not exists admins_auth_user_id_idx on public.admins(auth_user_id);
create index if not exists admins_role_id_idx on public.admins(role_id);
create index if not exists admins_is_active_idx on public.admins(is_active);
create index if not exists admins_is_online_idx on public.admins(is_online);
create index if not exists admins_last_seen_idx on public.admins(last_seen desc);
create index if not exists admins_username_idx on public.admins(username);
create index if not exists admins_created_by_idx on public.admins(created_by);
create index if not exists admins_updated_by_idx on public.admins(updated_by);

create index if not exists admin_permissions_key_idx on public.admin_permissions(key);
create index if not exists admin_permissions_category_idx on public.admin_permissions(category);
create index if not exists admin_permissions_is_active_idx on public.admin_permissions(is_active);

create index if not exists role_permissions_role_id_idx on public.role_permissions(role_id);
create index if not exists role_permissions_permission_id_idx on public.role_permissions(permission_id);

create index if not exists staff_chat_created_at_idx on public.staff_chat_messages(created_at desc);
create index if not exists staff_chat_sender_idx on public.staff_chat_messages(sender_admin_id);
create index if not exists staff_chat_is_deleted_idx on public.staff_chat_messages(is_deleted);

create index if not exists admin_presence_admin_idx on public.admin_presence(admin_id);
create index if not exists admin_presence_session_idx on public.admin_presence(session_id);
create index if not exists admin_presence_status_idx on public.admin_presence(status);
create index if not exists admin_presence_heartbeat_idx on public.admin_presence(last_heartbeat desc);

create index if not exists admin_sessions_admin_idx on public.admin_sessions(admin_id);
create index if not exists admin_sessions_auth_user_idx on public.admin_sessions(auth_user_id);
create index if not exists admin_sessions_last_seen_idx on public.admin_sessions(last_seen desc);

create index if not exists audit_logs_actor_idx on public.audit_logs(actor_admin_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_target_idx on public.audit_logs(target_type, target_id);

alter table public.admin_roles enable row level security;
alter table public.admins enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.staff_chat_messages enable row level security;
alter table public.admin_presence enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.audit_logs enable row level security;

comment on table public.admin_roles is 'Admin role/rank definitions. RLS policies must be reviewed before public frontend use.';
comment on table public.admins is 'Admin profile and permission layer linked to Supabase Auth users. Passwords must never be stored here.';
comment on table public.admin_permissions is 'Permission catalog for panel features and future actions.';
comment on table public.role_permissions is 'Many-to-many role permission mapping.';
comment on table public.staff_chat_messages is 'Realtime staff chat messages. RLS must restrict read/send to approved active admins.';
comment on table public.admin_presence is 'Heartbeat/presence rows for active admin sessions.';
comment on table public.admin_sessions is 'Admin session history for audit and last-seen tracking.';
comment on table public.audit_logs is 'Append-oriented audit events for auth, admin changes, role changes, and future server actions.';

comment on column public.admins.auth_user_id is 'References auth.users.id. Supabase Auth stores passwords; this table stores profile data only.';
comment on column public.admin_permissions.is_dangerous is 'Marks permissions that require extra care and should not be exposed until backend validation exists.';

-- RLS policy placeholders:
-- 1. Allow active authenticated admins to read safe profile, role, permission, chat, and presence data.
-- 2. Allow admins to update only their own presence/session heartbeat.
-- 3. Allow staff_chat.send holders to insert chat messages.
-- 4. Allow admins.manage holders to manage admins.
-- 5. Allow roles.manage holders to manage roles and role_permissions.
-- 6. Allow audit_logs inserts for approved app flows, and restrict audit reads to audit_logs.view holders.
-- 7. Do not expose dangerous future action permissions until a trusted backend/Edge Function exists.
