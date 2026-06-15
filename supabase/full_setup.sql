-- ============================================================
-- ACE Admin Panel — Full Setup SQL
-- ============================================================
-- Single-file deployment script for a fresh Supabase project.
-- Combines all migrations (001–009) and seed data (001) in
-- correct execution order.
--
-- Generated: 2026-06-15
-- Source migrations : supabase/migrations/001–009
-- Source seed       : supabase/seed/001_roles_permissions_seed.sql
--
-- HOW TO RUN THIS FILE IN SUPABASE SQL EDITOR
-- ============================================================
-- 1. Open your Supabase project dashboard.
-- 2. Go to: Database → SQL Editor → New query.
-- 3. Paste the ENTIRE contents of this file into the editor.
-- 4. (Optional) If you want the automated chat-cleanup job,
--    first enable pg_cron:
--      Database → Extensions → search "pg_cron" → enable it.
--    If you skip this, comment out or delete SECTION 6 below
--    before running.
-- 5. Click "Run" (or press Ctrl+Enter / Cmd+Enter).
-- 6. Wait for "Success. No rows returned." on every statement.
--    If any statement fails, the editor stops there. Fix the
--    error and re-run from that point — every statement in this
--    file is written with IF NOT EXISTS / OR REPLACE / ON
--    CONFLICT so it is safe to re-run on a partially applied
--    database.
-- 7. After the script finishes, create your first admin user:
--      a. Supabase dashboard → Authentication → Users → Add user.
--         Use the admin's real email as the Auth email.
--      b. Insert a matching row into public.admins (username,
--         display_name, display_lastname, role_id, auth_email,
--         auth_user_id from the new Auth user's UUID, is_active).
-- 8. Done. Deploy the Next.js app and log in.
--
-- IMPORTANT NOTES
-- ============================================================
-- • No secrets are stored in this file.
-- • Passwords are managed entirely by Supabase Auth — never
--   stored in public.admins.
-- • RLS is enabled on every table. No public (anon) access is
--   granted anywhere.
-- • SECTION 6 (pg_cron) is optional. Skip it if you do not
--   need automated hourly cleanup of old staff chat messages.
-- ============================================================


-- ============================================================
-- SECTION 1 — EXTENSIONS
-- from migration 001_admin_panel_foundation.sql
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- SECTION 2 — SHARED UTILITY FUNCTIONS
-- from migration 001_admin_panel_foundation.sql
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- SECTION 3 — CORE TABLES
-- from migrations 001, 002, 004
-- ============================================================

-- admin_roles: role/rank definitions
create table if not exists public.admin_roles (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null unique,
  label       text        not null,
  rank_level  integer     not null unique,
  color       text        not null default '#A1A1AA',
  is_system   boolean     not null default false,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- admins: panel user profiles linked to Supabase Auth
-- Passwords are NEVER stored here — Supabase Auth owns them.
create table if not exists public.admins (
  id                uuid        primary key default gen_random_uuid(),
  auth_user_id      uuid        unique references auth.users(id) on delete set null,
  username          text        not null unique,
  first_name        text        not null default '',
  last_name         text        not null default '',
  display_name      text        not null,
  display_lastname  text        not null default '',   -- added in migration 002
  staff_id          text,                              -- added in migration 002
  auth_email        text        not null,              -- added in migration 004
  role_id           uuid        references public.admin_roles(id) on delete set null,
  rank_color        text,
  is_active         boolean     not null default true,
  is_online         boolean     not null default false,
  last_seen         timestamptz,
  created_by        uuid        references public.admins(id) on delete set null,
  updated_by        uuid        references public.admins(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- admin_permissions: permission catalog
create table if not exists public.admin_permissions (
  id            uuid        primary key default gen_random_uuid(),
  key           text        not null unique,
  label         text        not null,
  description   text,
  category      text        not null default 'general',
  is_dangerous  boolean     not null default false,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- role_permissions: many-to-many role ↔ permission mapping
create table if not exists public.role_permissions (
  id             uuid        primary key default gen_random_uuid(),
  role_id        uuid        not null references public.admin_roles(id) on delete cascade,
  permission_id  uuid        not null references public.admin_permissions(id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (role_id, permission_id)
);

-- staff_chat_messages: realtime staff chat
create table if not exists public.staff_chat_messages (
  id               uuid        primary key default gen_random_uuid(),
  sender_admin_id  uuid        references public.admins(id) on delete set null,
  body             text        not null check (char_length(body) between 1 and 2000),
  is_deleted       boolean     not null default false,
  deleted_by       uuid        references public.admins(id) on delete set null,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- admin_presence: heartbeat / online status
-- One row per admin (enforced by unique index in section 5).
create table if not exists public.admin_presence (
  id              uuid        primary key default gen_random_uuid(),
  admin_id        uuid        not null references public.admins(id) on delete cascade,
  session_id      uuid        not null,
  status          text        not null default 'online'
                              check (status in ('online', 'idle', 'offline')),
  current_page    text,
  last_heartbeat  timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (admin_id, session_id)
);

-- admin_sessions: session history for audit and last-seen
create table if not exists public.admin_sessions (
  id            uuid        primary key default gen_random_uuid(),
  admin_id      uuid        not null references public.admins(id) on delete cascade,
  auth_user_id  uuid        references auth.users(id) on delete set null,
  user_agent    text,
  ip_hash       text,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  last_seen     timestamptz not null default now(),
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- audit_logs: append-only security and activity log
create table if not exists public.audit_logs (
  id                  uuid        primary key default gen_random_uuid(),
  actor_admin_id      uuid        references public.admins(id) on delete set null,
  actor_auth_user_id  uuid        references auth.users(id) on delete set null,
  action              text        not null,
  target_type         text,
  target_id           text,
  severity            text        not null default 'info'
                                  check (severity in ('debug', 'info', 'warning', 'danger')),
  metadata            jsonb       not null default '{}'::jsonb,
  ip_hash             text,
  user_agent          text,
  created_at          timestamptz not null default now()
);


-- ============================================================
-- SECTION 4 — FUTURE SYNC TABLES (PHASE 6)
-- from migration 008_phase6_admin_productivity_foundation.sql
-- ============================================================

-- synced_players: populated by future RAGE:MP bridge
create table if not exists public.synced_players (
  id                uuid        primary key default gen_random_uuid(),
  server_player_id  text        unique,
  display_name      text        not null,
  status            text        not null default 'offline'
                                check (status in ('online', 'offline', 'unknown')),
  faction           text,
  cash              numeric     not null default 0,
  bank              numeric     not null default 0,
  last_seen         timestamptz,
  metadata          jsonb       not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- synced_vehicles
create table if not exists public.synced_vehicles (
  id                 uuid        primary key default gen_random_uuid(),
  server_vehicle_id  text        unique,
  model_name         text        not null,
  plate              text,
  owner_name         text,
  status             text        not null default 'unknown',
  metadata           jsonb       not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- synced_factions
create table if not exists public.synced_factions (
  id                  uuid        primary key default gen_random_uuid(),
  server_faction_id   text        unique,
  name                text        not null,
  member_count        integer     not null default 0,
  metadata            jsonb       not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- synced_businesses
create table if not exists public.synced_businesses (
  id                   uuid        primary key default gen_random_uuid(),
  server_business_id   text        unique,
  name                 text        not null,
  owner_name           text,
  metadata             jsonb       not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- synced_map_markers
create table if not exists public.synced_map_markers (
  id           uuid        primary key default gen_random_uuid(),
  marker_type  text        not null,
  label        text        not null,
  x            numeric     not null,
  y            numeric     not null,
  z            numeric,
  metadata     jsonb       not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- ============================================================
-- SECTION 5 — TRIGGERS AND INDEXES
-- from migrations 001, 007, 008
-- ============================================================

-- updated_at triggers — core tables

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

-- updated_at triggers — sync tables

drop trigger if exists set_synced_players_updated_at on public.synced_players;
create trigger set_synced_players_updated_at
before update on public.synced_players
for each row execute function public.set_updated_at();

drop trigger if exists set_synced_vehicles_updated_at on public.synced_vehicles;
create trigger set_synced_vehicles_updated_at
before update on public.synced_vehicles
for each row execute function public.set_updated_at();

drop trigger if exists set_synced_factions_updated_at on public.synced_factions;
create trigger set_synced_factions_updated_at
before update on public.synced_factions
for each row execute function public.set_updated_at();

drop trigger if exists set_synced_businesses_updated_at on public.synced_businesses;
create trigger set_synced_businesses_updated_at
before update on public.synced_businesses
for each row execute function public.set_updated_at();

drop trigger if exists set_synced_map_markers_updated_at on public.synced_map_markers;
create trigger set_synced_map_markers_updated_at
before update on public.synced_map_markers
for each row execute function public.set_updated_at();

-- Indexes — admin_roles
create index if not exists admin_roles_rank_level_idx on public.admin_roles(rank_level);
create index if not exists admin_roles_is_active_idx  on public.admin_roles(is_active);

-- Indexes — admins
create index if not exists admins_auth_user_id_idx on public.admins(auth_user_id);
create index if not exists admins_role_id_idx      on public.admins(role_id);
create index if not exists admins_is_active_idx    on public.admins(is_active);
create index if not exists admins_is_online_idx    on public.admins(is_online);
create index if not exists admins_last_seen_idx    on public.admins(last_seen desc);
create index if not exists admins_username_idx     on public.admins(username);
create index if not exists admins_created_by_idx   on public.admins(created_by);
create index if not exists admins_updated_by_idx   on public.admins(updated_by);

-- Unique partial index: staff_id is nullable; unique only when set
create unique index if not exists admins_staff_id_unique_idx
  on public.admins(staff_id)
  where staff_id is not null;

-- Unique partial index: auth_email is case-insensitive unique when set
create unique index if not exists admins_auth_email_unique_idx
  on public.admins(lower(auth_email))
  where auth_email is not null;

-- Indexes — admin_permissions
create index if not exists admin_permissions_key_idx       on public.admin_permissions(key);
create index if not exists admin_permissions_category_idx  on public.admin_permissions(category);
create index if not exists admin_permissions_is_active_idx on public.admin_permissions(is_active);

-- Indexes — role_permissions
create index if not exists role_permissions_role_id_idx       on public.role_permissions(role_id);
create index if not exists role_permissions_permission_id_idx on public.role_permissions(permission_id);

-- Indexes — staff_chat_messages
create index if not exists staff_chat_created_at_idx on public.staff_chat_messages(created_at desc);
create index if not exists staff_chat_sender_idx     on public.staff_chat_messages(sender_admin_id);
create index if not exists staff_chat_is_deleted_idx on public.staff_chat_messages(is_deleted);

-- Indexes — admin_presence
-- Migration 007: deduplicate any existing presence rows, then enforce one row per admin.
with ranked_presence as (
  select
    id,
    row_number() over (
      partition by admin_id
      order by last_heartbeat desc, updated_at desc, created_at desc
    ) as row_number
  from public.admin_presence
)
delete from public.admin_presence p
using ranked_presence r
where p.id = r.id
  and r.row_number > 1;

drop index if exists admin_presence_one_row_per_admin_idx;
create unique index admin_presence_one_row_per_admin_idx
  on public.admin_presence(admin_id);

create index if not exists admin_presence_admin_idx     on public.admin_presence(admin_id);
create index if not exists admin_presence_session_idx   on public.admin_presence(session_id);
create index if not exists admin_presence_status_idx    on public.admin_presence(status);
create index if not exists admin_presence_heartbeat_idx on public.admin_presence(last_heartbeat desc);

-- Indexes — admin_sessions
create index if not exists admin_sessions_admin_idx     on public.admin_sessions(admin_id);
create index if not exists admin_sessions_auth_user_idx on public.admin_sessions(auth_user_id);
create index if not exists admin_sessions_last_seen_idx on public.admin_sessions(last_seen desc);

-- Indexes — audit_logs
create index if not exists audit_logs_actor_idx      on public.audit_logs(actor_admin_id);
create index if not exists audit_logs_action_idx     on public.audit_logs(action);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_target_idx     on public.audit_logs(target_type, target_id);

-- Indexes — sync tables
create index if not exists synced_players_status_idx    on public.synced_players(status);
create index if not exists synced_players_last_seen_idx on public.synced_players(last_seen desc);
create index if not exists synced_vehicles_plate_idx    on public.synced_vehicles(plate);
create index if not exists synced_factions_name_idx     on public.synced_factions(name);
create index if not exists synced_businesses_name_idx   on public.synced_businesses(name);
create index if not exists synced_map_markers_type_idx  on public.synced_map_markers(marker_type);


-- ============================================================
-- SECTION 6 — OPTIONAL: pg_cron SCHEDULED CHAT CLEANUP
-- from migration 006_staff_chat_hourly_cleanup.sql
-- ============================================================
-- Requires pg_cron to be enabled in the Supabase dashboard
-- BEFORE running this section:
--   Database → Extensions → search "pg_cron" → enable it.
--
-- If you do NOT want automated cleanup, delete or comment out
-- everything between the START and END markers below.
-- The panel works without it — old messages just accumulate.
-- ────────────────────────────────────────────────────────────
-- START OPTIONAL pg_cron SECTION

create extension if not exists pg_cron with schema extensions;

create or replace function public.cleanup_old_staff_chat_messages()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.staff_chat_messages
  where created_at < now() - interval '1 hour';
$$;

comment on function public.cleanup_old_staff_chat_messages()
  is 'Deletes staff chat messages older than 1 hour. Does not touch admin_presence.';

revoke all on function public.cleanup_old_staff_chat_messages() from public;

select cron.unschedule('ace_staff_chat_hourly_cleanup')
where exists (
  select 1 from cron.job where jobname = 'ace_staff_chat_hourly_cleanup'
);

select cron.schedule(
  'ace_staff_chat_hourly_cleanup',
  '0 * * * *',
  $$select public.cleanup_old_staff_chat_messages();$$
);

-- END OPTIONAL pg_cron SECTION
-- ────────────────────────────────────────────────────────────


-- ============================================================
-- SECTION 7 — ROW LEVEL SECURITY: ENABLE ON ALL TABLES
-- from migrations 001, 008
-- ============================================================

alter table public.admin_roles         enable row level security;
alter table public.admins              enable row level security;
alter table public.admin_permissions   enable row level security;
alter table public.role_permissions    enable row level security;
alter table public.staff_chat_messages enable row level security;
alter table public.admin_presence      enable row level security;
alter table public.admin_sessions      enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.synced_players      enable row level security;
alter table public.synced_vehicles     enable row level security;
alter table public.synced_factions     enable row level security;
alter table public.synced_businesses   enable row level security;
alter table public.synced_map_markers  enable row level security;


-- ============================================================
-- SECTION 8 — SCHEMA GRANTS
-- from migrations 003, 005, 008, 009
-- ============================================================

grant usage on schema public to authenticated;

-- Core tables: read access for all authenticated admins
grant select           on table public.admins              to authenticated;
grant select           on table public.admin_roles         to authenticated;
grant select           on table public.admin_permissions   to authenticated;
grant select           on table public.role_permissions    to authenticated;

-- Staff chat and presence: read + write (RLS restricts further)
grant select, insert   on table public.staff_chat_messages to authenticated;
grant select, insert, update on table public.admin_presence to authenticated;

-- Audit and sessions
grant select, insert   on table public.audit_logs          to authenticated;
grant select           on table public.admin_sessions      to authenticated;

-- Sync tables: read only (future RAGE:MP bridge writes via trusted service role)
grant select           on table public.synced_players      to authenticated;
grant select           on table public.synced_vehicles     to authenticated;
grant select           on table public.synced_factions     to authenticated;
grant select           on table public.synced_businesses   to authenticated;
grant select           on table public.synced_map_markers  to authenticated;


-- ============================================================
-- SECTION 9 — SECURITY FUNCTIONS
-- from migrations 003, 004, 005
-- ============================================================

-- is_active_admin(): true when auth.uid() belongs to an active admin profile.
-- Used as the base check for every RLS policy in this panel.
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

comment on function public.is_active_admin()
  is 'Returns true when auth.uid() belongs to an active admin profile. Base check for all panel RLS policies.';

revoke all   on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;

-- current_admin_id(): returns the admin profile UUID for auth.uid().
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

comment on function public.current_admin_id()
  is 'Returns the active admin profile id for auth.uid().';

revoke all   on function public.current_admin_id() from public;
grant execute on function public.current_admin_id() to authenticated;

-- admin_has_permission(): checks whether the current admin holds a given permission key.
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
    join public.admin_permissions p  on p.id = rp.permission_id
    where a.auth_user_id = auth.uid()
      and a.is_active     = true
      and p.key           = p_permission_key
      and p.is_active     = true
  );
$$;

comment on function public.admin_has_permission(text)
  is 'Checks active admin role permissions for the current Supabase Auth user.';

revoke all   on function public.admin_has_permission(text) from public;
grant execute on function public.admin_has_permission(text) to authenticated;

-- lookup_admin_auth_email(): server-side username login helper.
-- Returns the internal Supabase Auth email for an active admin username.
-- Called only from the server-side login API route — never from the browser.
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
  where lower(a.username)  = lower(trim(p_username))
    and a.is_active         = true
    and r.is_active         = true
  limit 1;
$$;

comment on function public.lookup_admin_auth_email(text)
  is 'Returns the internal auth_email for an active approved admin username. Server-side login route only.';

revoke all   on function public.lookup_admin_auth_email(text) from public;
grant execute on function public.lookup_admin_auth_email(text) to anon, authenticated;


-- ============================================================
-- SECTION 10 — ROW LEVEL SECURITY POLICIES
-- from migrations 003, 005, 008, 009
--
-- Policy notes:
--   • Migration 003 added base read-only policies.
--   • Migration 005 replaced the admins read policy with a
--     broader active-admins-read-all policy, and added write
--     policies for chat and presence.
--   • Migration 009 superseded the 005 presence read policy —
--     removing the staff_chat.view requirement so all active
--     admins can see who is online.
--   The DROP IF EXISTS guards below make every policy safe to
--   re-run and resolve all overlaps from the migration history.
-- ============================================================

-- ── admins ────────────────────────────────────────────────

-- Policy from migration 003 (own-profile only) is superseded
-- by the broader policy from migration 005. Drop both names so
-- neither conflicts.
drop policy if exists "active admins can read own admin profile"          on public.admins;
drop policy if exists "active admins can read active admin display profiles" on public.admins;

-- Final policy: any active admin can read all active admin profiles.
create policy "active admins can read active admin display profiles"
on public.admins
for select
to authenticated
using (is_active = true and public.is_active_admin());

-- ── admin_roles ───────────────────────────────────────────

drop policy if exists "active admins can read active roles" on public.admin_roles;
create policy "active admins can read active roles"
on public.admin_roles
for select
to authenticated
using (is_active = true and public.is_active_admin());

-- ── admin_permissions ─────────────────────────────────────

drop policy if exists "active admins can read active permissions" on public.admin_permissions;
create policy "active admins can read active permissions"
on public.admin_permissions
for select
to authenticated
using (is_active = true and public.is_active_admin());

-- ── role_permissions ──────────────────────────────────────

drop policy if exists "active admins can read role permissions" on public.role_permissions;
create policy "active admins can read role permissions"
on public.role_permissions
for select
to authenticated
using (public.is_active_admin());

-- ── staff_chat_messages ───────────────────────────────────

drop policy if exists "active admins can read staff chat messages" on public.staff_chat_messages;
drop policy if exists "staff chat viewers can read messages"       on public.staff_chat_messages;

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
  and is_deleted  = false
  and deleted_by  is null
  and deleted_at  is null
  and public.is_active_admin()
  and public.admin_has_permission('staff_chat.send')
);

-- ── admin_presence ────────────────────────────────────────
-- Final policy from migration 009: all active admins can read
-- presence (removes the earlier staff_chat.view requirement so
-- every logged-in admin can see who is online in the topbar).

drop policy if exists "active admins can read admin presence"            on public.admin_presence;
drop policy if exists "active admins can read presence with permission"  on public.admin_presence;
drop policy if exists "active admins can read all presence"              on public.admin_presence;

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

-- ── admin_sessions ────────────────────────────────────────

drop policy if exists "admins can read own sessions" on public.admin_sessions;
create policy "admins can read own sessions"
on public.admin_sessions
for select
to authenticated
using (
  admin_id = public.current_admin_id()
  and public.is_active_admin()
);

-- ── audit_logs ────────────────────────────────────────────

drop policy if exists "audit viewers can read audit logs"        on public.audit_logs;
drop policy if exists "active admins can insert own audit logs"  on public.audit_logs;

create policy "audit viewers can read audit logs"
on public.audit_logs
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('audit_logs.view')
);

create policy "active admins can insert own audit logs"
on public.audit_logs
for insert
to authenticated
with check (
  actor_admin_id     = public.current_admin_id()
  and actor_auth_user_id = auth.uid()
  and public.is_active_admin()
);

-- ── synced_players ────────────────────────────────────────

drop policy if exists "players viewers can read synced players" on public.synced_players;
create policy "players viewers can read synced players"
on public.synced_players
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('players.view')
);

-- ── synced_vehicles ───────────────────────────────────────

drop policy if exists "vehicles viewers can read synced vehicles" on public.synced_vehicles;
create policy "vehicles viewers can read synced vehicles"
on public.synced_vehicles
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('vehicles.view')
);

-- ── synced_factions ───────────────────────────────────────

drop policy if exists "factions viewers can read synced factions" on public.synced_factions;
create policy "factions viewers can read synced factions"
on public.synced_factions
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('factions.view')
);

-- ── synced_businesses ─────────────────────────────────────

drop policy if exists "businesses viewers can read synced businesses" on public.synced_businesses;
create policy "businesses viewers can read synced businesses"
on public.synced_businesses
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('businesses.view')
);

-- ── synced_map_markers ────────────────────────────────────

drop policy if exists "dashboard viewers can read synced map markers" on public.synced_map_markers;
create policy "dashboard viewers can read synced map markers"
on public.synced_map_markers
for select
to authenticated
using (
  public.is_active_admin()
  and public.admin_has_permission('dashboard.view')
);


-- ============================================================
-- SECTION 11 — TABLE AND COLUMN COMMENTS
-- from migration 001
-- ============================================================

comment on table public.admin_roles
  is 'Admin role/rank definitions.';
comment on table public.admins
  is 'Admin profile and permission layer linked to Supabase Auth. Passwords are never stored here.';
comment on table public.admin_permissions
  is 'Permission catalog for panel features and future actions.';
comment on table public.role_permissions
  is 'Many-to-many role ↔ permission mapping.';
comment on table public.staff_chat_messages
  is 'Realtime staff chat messages. RLS restricts read/send to approved active admins.';
comment on table public.admin_presence
  is 'Heartbeat/presence rows for active admin sessions. One row per admin enforced by unique index.';
comment on table public.admin_sessions
  is 'Admin session history for audit and last-seen tracking.';
comment on table public.audit_logs
  is 'Append-only audit events for auth, admin changes, role changes, and future server actions.';

comment on column public.admins.auth_user_id
  is 'References auth.users.id. Supabase Auth stores passwords; this table stores profile data only.';
comment on column public.admins.username
  is 'Internal/login identity. Do not show as the public admin display name in the panel.';
comment on column public.admins.staff_id
  is 'Visible admin/staff ID shown in the panel. Unique when set.';
comment on column public.admins.display_name
  is 'Visible first-name display value shown in the panel.';
comment on column public.admins.display_lastname
  is 'Visible last-name display value shown in the panel.';
comment on column public.admins.auth_email
  is 'Internal Supabase Auth email for password sign-in. Never show this in the admin panel UI.';
comment on column public.admins.role_id
  is 'References admin_roles. Visible rank name and color come from the related role.';
comment on column public.admin_permissions.is_dangerous
  is 'Marks permissions that require extra care; do not expose until backend validation exists.';
comment on index public.admin_presence_one_row_per_admin_idx
  is 'Ensures one presence row per admin so refresh/reconnect updates instead of duplicating online users.';


-- ============================================================
-- SECTION 12 — SEED DATA: ROLES, PERMISSIONS, ROLE PERMISSIONS
-- from seed/001_roles_permissions_seed.sql
-- ============================================================
-- This seed is idempotent: ON CONFLICT DO UPDATE means it is
-- safe to re-run at any time without creating duplicates.
-- It does NOT insert any admin user rows — create those
-- manually via Supabase Auth + a public.admins insert.
-- ============================================================

-- Deactivate any legacy role names that were replaced
update public.admin_roles
set   is_active  = false,
      updated_at = now()
where name in (
  'owner',
  'founder',
  'head_management',
  'management',
  'senior_admin',
  'admin',
  'helper'
);

-- Insert / update the 8 production roles
insert into public.admin_roles (name, label, rank_level, color, is_system, is_active)
values
  ('project_supervisor',                   'Project Supervisor',                               10, '#ff0000', true, true),
  ('development_team',                     'Development Team',                                  9, '#310010', true, true),
  ('chief_of_graphics',                    'Chief of Graphics',                                 8, '#e91e63', true, true),
  ('chief_administrator',                  'Chief Administrator',                               7, '#00ccff', true, true),
  ('deputy_chief_administrator_curator',   'Deputy Chief Administrator + Curator of Administrator', 6, '#0045a1', true, true),
  ('senior_administrator',                 'Senior Administrator',                              5, '#ff9800', true, true),
  ('server_administrator_curator',         'Server Administrator Curator',                      4, '#27F52A', true, true),
  ('server_administrator',                 'Server Administrator',                              3, '#ad1457', true, true)
on conflict (name) do update set
  label      = excluded.label,
  rank_level = excluded.rank_level,
  color      = excluded.color,
  is_system  = excluded.is_system,
  is_active  = excluded.is_active,
  updated_at = now();

-- Insert / update the 17 production permissions
insert into public.admin_permissions (key, label, description, category, is_dangerous, is_active)
values
  ('dashboard.view',        'View dashboard',             'Open and view the main dashboard.',                 'dashboard',      false, true),
  ('players.view',          'View players',               'View player and character records.',                'players',        false, true),
  ('vehicles.view',         'View vehicles',              'View vehicle records.',                             'vehicles',       false, true),
  ('businesses.view',       'View businesses',            'View business records.',                            'businesses',     false, true),
  ('factions.view',         'View factions',              'View faction records.',                             'factions',       false, true),
  ('logs.view',             'View logs',                  'View panel and server logs.',                       'logs',           false, true),
  ('staff_chat.view',       'View staff chat',            'Read staff chat messages.',                         'staff_chat',     false, true),
  ('staff_chat.send',       'Send staff chat messages',   'Send messages in staff chat.',                      'staff_chat',     false, true),
  ('admins.view',           'View admins',                'View admin profile and role data.',                 'admins',         false, true),
  ('admins.manage',         'Manage admins',              'Create, edit, enable, or disable admins.',          'admins',         true,  true),
  ('roles.view',            'View roles',                 'View roles and permissions.',                       'roles',          false, true),
  ('roles.manage',          'Manage roles',               'Create, edit, or assign roles and permissions.',    'roles',          true,  true),
  ('audit_logs.view',       'View audit logs',            'View security and admin activity audit logs.',      'audit_logs',     false, true),
  ('future.kick',           'Future kick action',         'Reserved for future player kick actions.',          'future_actions', true,  true),
  ('future.ban',            'Future ban action',          'Reserved for future player ban actions.',           'future_actions', true,  true),
  ('future.warn',           'Future warn action',         'Reserved for future player warn actions.',          'future_actions', true,  true),
  ('future.ragemp.actions', 'Future RAGE:MP actions',     'Reserved for future RAGE:MP server actions.',       'future_actions', true,  true)
on conflict (key) do update set
  label        = excluded.label,
  description  = excluded.description,
  category     = excluded.category,
  is_dangerous = excluded.is_dangerous,
  is_active    = excluded.is_active,
  updated_at   = now();

-- Assign permissions to roles via a values CTE
-- Inserting only — existing mappings are kept (ON CONFLICT DO NOTHING).
with role_permission_matrix (role_name, permission_key) as (
  values
    -- Rank 10: Project Supervisor — all permissions
    ('project_supervisor', 'dashboard.view'),
    ('project_supervisor', 'players.view'),
    ('project_supervisor', 'vehicles.view'),
    ('project_supervisor', 'businesses.view'),
    ('project_supervisor', 'factions.view'),
    ('project_supervisor', 'logs.view'),
    ('project_supervisor', 'staff_chat.view'),
    ('project_supervisor', 'staff_chat.send'),
    ('project_supervisor', 'admins.view'),
    ('project_supervisor', 'admins.manage'),
    ('project_supervisor', 'roles.view'),
    ('project_supervisor', 'roles.manage'),
    ('project_supervisor', 'audit_logs.view'),
    ('project_supervisor', 'future.kick'),
    ('project_supervisor', 'future.ban'),
    ('project_supervisor', 'future.warn'),
    ('project_supervisor', 'future.ragemp.actions'),

    -- Rank 9: Development Team — all permissions
    ('development_team', 'dashboard.view'),
    ('development_team', 'players.view'),
    ('development_team', 'vehicles.view'),
    ('development_team', 'businesses.view'),
    ('development_team', 'factions.view'),
    ('development_team', 'logs.view'),
    ('development_team', 'staff_chat.view'),
    ('development_team', 'staff_chat.send'),
    ('development_team', 'admins.view'),
    ('development_team', 'admins.manage'),
    ('development_team', 'roles.view'),
    ('development_team', 'roles.manage'),
    ('development_team', 'audit_logs.view'),
    ('development_team', 'future.kick'),
    ('development_team', 'future.ban'),
    ('development_team', 'future.warn'),
    ('development_team', 'future.ragemp.actions'),

    -- Rank 8: Chief of Graphics — view + staff chat, no manage/dangerous
    ('chief_of_graphics', 'dashboard.view'),
    ('chief_of_graphics', 'players.view'),
    ('chief_of_graphics', 'vehicles.view'),
    ('chief_of_graphics', 'businesses.view'),
    ('chief_of_graphics', 'factions.view'),
    ('chief_of_graphics', 'logs.view'),
    ('chief_of_graphics', 'staff_chat.view'),
    ('chief_of_graphics', 'staff_chat.send'),
    ('chief_of_graphics', 'admins.view'),
    ('chief_of_graphics', 'roles.view'),

    -- Rank 7: Chief Administrator — high management, no roles.manage
    ('chief_administrator', 'dashboard.view'),
    ('chief_administrator', 'players.view'),
    ('chief_administrator', 'vehicles.view'),
    ('chief_administrator', 'businesses.view'),
    ('chief_administrator', 'factions.view'),
    ('chief_administrator', 'logs.view'),
    ('chief_administrator', 'staff_chat.view'),
    ('chief_administrator', 'staff_chat.send'),
    ('chief_administrator', 'admins.view'),
    ('chief_administrator', 'admins.manage'),
    ('chief_administrator', 'roles.view'),
    ('chief_administrator', 'audit_logs.view'),
    ('chief_administrator', 'future.kick'),
    ('chief_administrator', 'future.ban'),
    ('chief_administrator', 'future.warn'),

    -- Rank 6: Deputy Chief Administrator + Curator — no future.ban
    ('deputy_chief_administrator_curator', 'dashboard.view'),
    ('deputy_chief_administrator_curator', 'players.view'),
    ('deputy_chief_administrator_curator', 'vehicles.view'),
    ('deputy_chief_administrator_curator', 'businesses.view'),
    ('deputy_chief_administrator_curator', 'factions.view'),
    ('deputy_chief_administrator_curator', 'logs.view'),
    ('deputy_chief_administrator_curator', 'staff_chat.view'),
    ('deputy_chief_administrator_curator', 'staff_chat.send'),
    ('deputy_chief_administrator_curator', 'admins.view'),
    ('deputy_chief_administrator_curator', 'admins.manage'),
    ('deputy_chief_administrator_curator', 'roles.view'),
    ('deputy_chief_administrator_curator', 'audit_logs.view'),
    ('deputy_chief_administrator_curator', 'future.kick'),
    ('deputy_chief_administrator_curator', 'future.warn'),

    -- Rank 5: Senior Administrator — no manage permissions
    ('senior_administrator', 'dashboard.view'),
    ('senior_administrator', 'players.view'),
    ('senior_administrator', 'vehicles.view'),
    ('senior_administrator', 'businesses.view'),
    ('senior_administrator', 'factions.view'),
    ('senior_administrator', 'logs.view'),
    ('senior_administrator', 'staff_chat.view'),
    ('senior_administrator', 'staff_chat.send'),
    ('senior_administrator', 'admins.view'),
    ('senior_administrator', 'audit_logs.view'),
    ('senior_administrator', 'future.kick'),
    ('senior_administrator', 'future.warn'),

    -- Rank 4: Server Administrator Curator — no audit, no future.ban
    ('server_administrator_curator', 'dashboard.view'),
    ('server_administrator_curator', 'players.view'),
    ('server_administrator_curator', 'vehicles.view'),
    ('server_administrator_curator', 'businesses.view'),
    ('server_administrator_curator', 'factions.view'),
    ('server_administrator_curator', 'logs.view'),
    ('server_administrator_curator', 'staff_chat.view'),
    ('server_administrator_curator', 'staff_chat.send'),
    ('server_administrator_curator', 'admins.view'),
    ('server_administrator_curator', 'future.kick'),
    ('server_administrator_curator', 'future.warn'),

    -- Rank 3: Server Administrator — base permissions only
    ('server_administrator', 'dashboard.view'),
    ('server_administrator', 'players.view'),
    ('server_administrator', 'vehicles.view'),
    ('server_administrator', 'businesses.view'),
    ('server_administrator', 'factions.view'),
    ('server_administrator', 'logs.view'),
    ('server_administrator', 'staff_chat.view'),
    ('server_administrator', 'staff_chat.send'),
    ('server_administrator', 'admins.view'),
    ('server_administrator', 'future.warn')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_matrix rpm
join public.admin_roles       r on r.name = rpm.role_name
join public.admin_permissions p on p.key  = rpm.permission_key
on conflict (role_id, permission_id) do nothing;


-- ============================================================
-- END OF FILE
-- ============================================================
-- What this script created:
--   Tables    : 13 (admin_roles, admins, admin_permissions,
--                   role_permissions, staff_chat_messages,
--                   admin_presence, admin_sessions, audit_logs,
--                   synced_players, synced_vehicles,
--                   synced_factions, synced_businesses,
--                   synced_map_markers)
--   Functions : 4  (set_updated_at, is_active_admin,
--                   current_admin_id, admin_has_permission,
--                   lookup_admin_auth_email)
--   Triggers  : 10 (set_updated_at on every table with updated_at)
--   Indexes   : 32 (covering all FKs, status, created_at, and
--                   the one-row-per-admin unique presence index)
--   RLS       : enabled on all 13 tables
--   Policies  : 16 read/write policies across all tables
--   Seed      : 8 roles, 17 permissions, role_permission matrix
--
-- Next steps after running:
--   1. Create admin users in Supabase Auth (Authentication tab).
--   2. Insert matching rows into public.admins.
--   3. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
--      in your .env.local.
--   4. Deploy the Next.js app and log in.
-- ============================================================
