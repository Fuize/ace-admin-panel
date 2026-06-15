# ACE Admin Panel Supabase Foundation

This document describes the safe Supabase foundation for future phases. Nothing in the current app is migrated yet.

## Required Environment Variables

Add these public values to `.env.local` when Supabase work begins:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is the publishable/anon client key. It is allowed in browser code only when Supabase Row Level Security policies are correct.

Never use these in the frontend or commit them:

```env
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SECRET_KEY=
```

The service role key bypasses Row Level Security and must only live in trusted backend infrastructure. InfinityFree static hosting is not trusted backend infrastructure.

## Current Status

- Current auth remains unchanged.
- Current MySQL API routes remain unchanged.
- No Supabase tables have been created.
- No SQL has been applied to Supabase.
- RAGE:MP integration has not started.

## Added Foundation Files

Future Supabase helpers live under:

```txt
src/lib/supabase/client.ts
src/lib/supabase/types.ts
src/lib/supabase/auth.ts
src/lib/supabase/realtime.ts
src/lib/supabase/permissions.ts
src/lib/supabase/presence.ts
src/lib/supabase/audit.ts
```

These files are isolated and are not imported by the current pages.

## Draft SQL

The draft schema is stored at:

```txt
supabase/migrations/001_admin_panel_foundation.sql
```

The default roles and permissions seed draft is stored at:

```txt
supabase/seed/001_roles_permissions_seed.sql
```

These are repository drafts only. Do not run them until a dedicated Supabase database phase is approved.

The safe read-only RLS policy draft is stored at:

```txt
supabase/migrations/003_safe_rls_policies.sql
```

It adds approved-admin SELECT policies only. It does not add INSERT, UPDATE, or DELETE policies.

The username login auth-email draft is stored at:

```txt
supabase/migrations/004_admin_auth_email.sql
```

It adds `public.admins.auth_email` for the internal Supabase Auth identity used by the server-side username login route.

The staff chat and presence policy draft is stored at:

```txt
supabase/migrations/005_staff_chat_presence_policies.sql
```

It adds approved-admin helpers plus read/send chat policies and own-presence insert/update policies.

The staff chat hourly cleanup draft is stored at:

```txt
supabase/migrations/006_staff_chat_hourly_cleanup.sql
```

It schedules deletion of `staff_chat_messages` older than 1 hour. It does not delete presence rows.

The unique admin presence draft is stored at:

```txt
supabase/migrations/007_unique_admin_presence.sql
```

It removes duplicate presence rows per admin and enforces one `admin_presence` row per `admin_id`.

The phase 6 productivity foundation draft is stored at:

```txt
supabase/migrations/008_phase6_admin_productivity_foundation.sql
```

It adds future synced game-data tables, audit/session read policies, and safe own-audit insert policy for app auth events.

## Manual SQL Apply Order

When the database phase is approved, run SQL manually in the Supabase Dashboard SQL Editor in this exact order:

1. Open Supabase Dashboard.
2. Open the target project.
3. Go to SQL Editor.
4. Run the foundation schema first:

```txt
supabase/migrations/001_admin_panel_foundation.sql
```

5. If the base schema was already created before display fields were added, run the display fields adjustment:

```txt
supabase/migrations/002_admin_display_fields.sql
```

6. Run the roles and permissions seed next:

```txt
supabase/seed/001_roles_permissions_seed.sql
```

7. Run the safe read-only RLS policies next:

```txt
supabase/migrations/003_safe_rls_policies.sql
```

8. Run the username login auth-email migration last:

```txt
supabase/migrations/004_admin_auth_email.sql
```

If admins already exist, fill `public.admins.auth_email` for every row before enforcing `not null`. The migration intentionally stops with a clear error if any existing admin has a missing `auth_email`.

9. Run the staff chat and presence policies after chat permissions are seeded:

```txt
supabase/migrations/005_staff_chat_presence_policies.sql
```

10. Run the staff chat hourly cleanup schedule if `pg_cron` is available in the Supabase project:

```txt
supabase/migrations/006_staff_chat_hourly_cleanup.sql
```

11. Run the unique admin presence cleanup/index:

```txt
supabase/migrations/007_unique_admin_presence.sql
```

12. Run the phase 6 productivity foundation:

```txt
supabase/migrations/008_phase6_admin_productivity_foundation.sql
```

Do not run secrets in SQL. Do not paste service role keys, secret keys, JWT secrets, database passwords, or `.env.local` values into the SQL Editor.

To verify tables exist, run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'admin_roles',
    'admins',
    'admin_permissions',
    'role_permissions',
    'staff_chat_messages',
    'admin_presence',
    'admin_sessions',
    'audit_logs'
  )
order by table_name;
```

To verify seed data exists, run:

```sql
select name, label, rank_level, color, is_system
from public.admin_roles
order by rank_level desc;

select key, label, category, is_dangerous
from public.admin_permissions
order by category, key;
```

The foundation schema enables Row Level Security but only includes policy placeholders and comments. Before any static frontend reads/writes these tables, real RLS policies must be reviewed and added.

## Real ACE Admin Ranks

The seed file uses the real ACE admin ranks:

| Level | Slug | Label | Color |
| --- | --- | --- | --- |
| 10 | `project_supervisor` | Project Supervisor | `#ff0000` |
| 9 | `development_team` | Development Team | `#310010` |
| 8 | `chief_of_graphics` | Chief of Graphics | `#e91e63` |
| 7 | `chief_administrator` | Chief Administrator | `#00ccff` |
| 6 | `deputy_chief_administrator_curator` | Deputy Chief Administrator + Curator of Administrator | `#0045a1` |
| 5 | `senior_administrator` | Senior Administrator | `#ff9800` |
| 4 | `server_administrator_curator` | Server Administrator Curator | `#27F52A` |
| 3 | `server_administrator` | Server Administrator | `#ad1457` |

If the old demo seed was already run, the seed draft deactivates these old demo roles instead of deleting them:

```txt
owner
founder
head_management
management
senior_admin
admin
helper
```

They are left in place so existing `admins.role_id` references do not break.

## Supabase Login Plan

Supabase Auth is the password authority. Passwords must never be stored in app files or custom tables.

The `/login` page uses a username field in the UI. Users type only:

- username
- password

Supabase Auth still verifies passwords with email/password internally. The internal email is stored in `public.admins.auth_email` and is never shown in the panel UI.

Meaning of the two identity fields:

- `username`: the real login identity admins type into the UI.
- `auth_email`: internal Supabase Auth email used only by the server-side login route.

The `admins` table should act as the profile and permission layer:

- Auth identity from `auth.users`
- Internal username for login/profile matching
- Visible staff/admin ID
- Visible display name and display last name
- Active/disabled status
- Role/rank through `role_id`
- Last seen and online status

Login should be restricted to approved admins only. Disabled admins should be signed out or blocked immediately.

`/login` calls `/api/auth/username-login`. That route looks up the internal `auth_email` for the submitted username, signs in through Supabase Auth, verifies the approved active admin profile, and sets an HTTP-only Supabase access-token cookie used by middleware. `/panel` and protected API routes require that valid Supabase session plus an active admin profile and active role.

## Admin Profile Model

Every row in `public.admins` represents exactly one admin user profile.

Private/login-related fields:

- `auth_user_id`: links the profile to a Supabase Auth user.
- `username`: real login identity typed by the admin in the login UI.
- `auth_email`: internal Supabase Auth email for password verification. It should never be shown publicly in the panel.

Passwords must never be stored in `public.admins`. Passwords belong only in Supabase Auth.

Public/display-related fields:

- `id`: internal UUID primary key.
- `staff_id`: visible admin/staff ID shown in the panel.
- `display_name`: visible first/name display.
- `display_lastname`: visible last-name display.
- `role_id`: link to `public.admin_roles`.

Visible rank display:

- rank name should come from `admin_roles.label` or `admin_roles.name`.
- rank color should come from `admin_roles.color`.
- `admins.rank_color` exists only as an optional legacy/override field; the preferred display source is the role relation.

Status fields:

- `is_active`: disabled admins should be blocked from the panel.
- `is_online`: cached display status.
- `last_seen`: latest known activity time.

If the base schema has already been applied, run this draft adjustment manually after review:

```txt
supabase/migrations/002_admin_display_fields.sql
```

## Creating The First Owner Admin

Do this only after the schema and seed SQL are reviewed and manually applied.

1. Open Supabase Dashboard.
2. Go to Authentication -> Users.
3. Click Add user.
4. Create an email/password user for the first Owner.
   - Email should be the internal auth email you want to store in `public.admins.auth_email`.
   - The password stays only in Supabase Auth.
5. Copy the created Auth user id.
6. Go to Table Editor -> `admin_roles`.
7. Find the `project_supervisor` role and copy its `id`, or run:

```sql
select id from public.admin_roles where name = 'project_supervisor';
```

8. Go to Table Editor -> `admins`.
9. Insert a new row:
   - `auth_user_id` = copied Auth user id
   - `username` = Owner username typed on the login screen
   - `auth_email` = the Supabase Auth email from step 4
   - `staff_id` = visible Owner admin/staff ID
   - `first_name` = Owner first name
   - `last_name` = Owner last name
   - `display_name` = visible display name
   - `display_lastname` = visible display last name
   - `role_id` = Project Supervisor role id
   - `rank_color` = optional; prefer reading visible color from `admin_roles.color`
   - `is_active` = true
   - `created_by` = null for the first admin
   - `updated_by` = null for the first admin

Equivalent SQL example:

```sql
insert into public.admins (
  auth_user_id,
  auth_email,
  username,
  staff_id,
  first_name,
  last_name,
  display_name,
  display_lastname,
  role_id,
  rank_color,
  is_active,
  created_by,
  updated_by
)
values (
  '<AUTH_USER_ID>',
  'owner-auth-email@example.com',
  'owner_username',
  '1',
  'First',
  'Last',
  'First Last',
  'Last',
  (select id from public.admin_roles where name = 'project_supervisor'),
  null,
  true,
  null,
  null
);
```

Passwords must remain inside Supabase Auth only. The `public.admins` table is profile, status, and permission data.

## Supabase Test Page

The safe side-by-side test page is:

```txt
/supabase-test
```

It checks:

- Supabase public env configuration
- current Supabase Auth user
- matching `public.admins` profile
- role from `public.admin_roles`
- permissions from `public.role_permissions` and `public.admin_permissions`
- active/approved admin status

This page is only a diagnostic page. The real `/login` page uses the clean staff login UI and does not show Supabase debug details.

## RLS Policies

RLS is enabled in the foundation schema. If `supabase/migrations/003_safe_rls_policies.sql` is not applied yet, `/supabase-test` and `/login` may sign in successfully but fail to read `public.admins`, roles, or permissions.

Do not add unsafe public read policies like `using (true)` for admin data.

The reviewed read-only policy direction is:

```sql
-- Helper idea for future review, not yet applied:
-- active approved admin means:
-- exists public.admins row where auth_user_id = auth.uid() and is_active = true
```

Policy sketch to review before applying:

```sql
create policy "active admins can read their own profile"
on public.admins
for select
to authenticated
using (auth_user_id = auth.uid() and is_active = true);

create policy "active admins can read active roles"
on public.admin_roles
for select
to authenticated
using (
  is_active = true
  and exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  )
);

create policy "active admins can read active permissions"
on public.admin_permissions
for select
to authenticated
using (
  is_active = true
  and exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  )
);

create policy "active admins can read role permissions"
on public.role_permissions
for select
to authenticated
using (
  exists (
    select 1 from public.admins a
    where a.auth_user_id = auth.uid()
      and a.is_active = true
  )
);
```

The draft also lets active admins read active permissions, role-permission mappings, staff chat messages, and presence rows. Before adding write policies, define exact permission checks for `admins.manage`, `roles.manage`, `staff_chat.send`, and future dangerous actions.

## Future Chat, Presence, And Permissions

Staff chat should use `staff_chat_messages` with Supabase Realtime subscriptions.

Presence should use a combination of:

- Supabase Realtime presence for live online state
- `admin_presence` heartbeat rows for recovery and last-seen behavior
- `admin_sessions` for session history

Permissions should use:

- `admin_roles`
- `admin_permissions`
- `role_permissions`

The UI can hide unavailable features, but Row Level Security must enforce access.

## InfinityFree Static Hosting Warning

InfinityFree cannot run Node.js server code, Next.js API routes, middleware, direct MySQL connections, or filesystem-based auth.

Before deployment to InfinityFree, future phases must remove or replace:

- `src/app/api/*`
- `src/middleware.ts`
- direct MySQL usage from `src/lib/db.ts`
- filesystem auth from `src/lib/admins.ts`
- server JWT secret logic from the hosted frontend path

The likely deployment target is a static Next export using Supabase client-side reads protected by Supabase Auth and Row Level Security.

## Future Phase Order

1. Keep current app stable while Supabase files exist unused.
2. Create and review Supabase schema and RLS policies.
3. Move auth to Supabase Auth.
4. Move admins, roles, permissions, staff chat, presence, and audit logs to Supabase.
5. Replace current `/api/*` reads with Supabase client reads where safe.
6. Prepare static export for InfinityFree.
7. Plan a trusted backend bridge for any future RAGE:MP actions.
