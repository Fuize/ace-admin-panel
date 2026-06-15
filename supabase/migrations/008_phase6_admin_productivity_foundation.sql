-- ACE Admin Panel phase 6 productivity foundation.
-- Draft only: review and apply manually in Supabase SQL Editor.

create table if not exists public.synced_players (
  id uuid primary key default gen_random_uuid(),
  server_player_id text unique,
  display_name text not null,
  status text not null default 'offline' check (status in ('online', 'offline', 'unknown')),
  faction text,
  cash numeric not null default 0,
  bank numeric not null default 0,
  last_seen timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.synced_vehicles (
  id uuid primary key default gen_random_uuid(),
  server_vehicle_id text unique,
  model_name text not null,
  plate text,
  owner_name text,
  status text not null default 'unknown',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.synced_factions (
  id uuid primary key default gen_random_uuid(),
  server_faction_id text unique,
  name text not null,
  member_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.synced_businesses (
  id uuid primary key default gen_random_uuid(),
  server_business_id text unique,
  name text not null,
  owner_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.synced_map_markers (
  id uuid primary key default gen_random_uuid(),
  marker_type text not null,
  label text not null,
  x numeric not null,
  y numeric not null,
  z numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create index if not exists synced_players_status_idx on public.synced_players(status);
create index if not exists synced_players_last_seen_idx on public.synced_players(last_seen desc);
create index if not exists synced_vehicles_plate_idx on public.synced_vehicles(plate);
create index if not exists synced_factions_name_idx on public.synced_factions(name);
create index if not exists synced_businesses_name_idx on public.synced_businesses(name);
create index if not exists synced_map_markers_type_idx on public.synced_map_markers(marker_type);

alter table public.synced_players enable row level security;
alter table public.synced_vehicles enable row level security;
alter table public.synced_factions enable row level security;
alter table public.synced_businesses enable row level security;
alter table public.synced_map_markers enable row level security;

grant select on table public.audit_logs to authenticated;
grant insert on table public.audit_logs to authenticated;
grant select on table public.admin_sessions to authenticated;
grant select on table public.synced_players to authenticated;
grant select on table public.synced_vehicles to authenticated;
grant select on table public.synced_factions to authenticated;
grant select on table public.synced_businesses to authenticated;
grant select on table public.synced_map_markers to authenticated;

drop policy if exists "audit viewers can read audit logs" on public.audit_logs;
create policy "audit viewers can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_active_admin() and public.admin_has_permission('audit_logs.view'));

drop policy if exists "active admins can insert own audit logs" on public.audit_logs;
create policy "active admins can insert own audit logs"
on public.audit_logs
for insert
to authenticated
with check (
  actor_admin_id = public.current_admin_id()
  and actor_auth_user_id = auth.uid()
  and public.is_active_admin()
);

drop policy if exists "admins can read own sessions" on public.admin_sessions;
create policy "admins can read own sessions"
on public.admin_sessions
for select
to authenticated
using (admin_id = public.current_admin_id() and public.is_active_admin());

drop policy if exists "players viewers can read synced players" on public.synced_players;
create policy "players viewers can read synced players"
on public.synced_players
for select
to authenticated
using (public.is_active_admin() and public.admin_has_permission('players.view'));

drop policy if exists "vehicles viewers can read synced vehicles" on public.synced_vehicles;
create policy "vehicles viewers can read synced vehicles"
on public.synced_vehicles
for select
to authenticated
using (public.is_active_admin() and public.admin_has_permission('vehicles.view'));

drop policy if exists "factions viewers can read synced factions" on public.synced_factions;
create policy "factions viewers can read synced factions"
on public.synced_factions
for select
to authenticated
using (public.is_active_admin() and public.admin_has_permission('factions.view'));

drop policy if exists "businesses viewers can read synced businesses" on public.synced_businesses;
create policy "businesses viewers can read synced businesses"
on public.synced_businesses
for select
to authenticated
using (public.is_active_admin() and public.admin_has_permission('businesses.view'));

drop policy if exists "dashboard viewers can read synced map markers" on public.synced_map_markers;
create policy "dashboard viewers can read synced map markers"
on public.synced_map_markers
for select
to authenticated
using (public.is_active_admin() and public.admin_has_permission('dashboard.view'));

-- Future write/sync policies should be added only for a trusted RAGE:MP backend bridge.
