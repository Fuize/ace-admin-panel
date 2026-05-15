# MySQL To Supabase Migration Plan

This document prepares the ACE Admin Panel for a future migration away from local MySQL databases.

No migration has been performed yet. The current app still uses the existing MySQL-backed API routes.

## Final Direction

Target architecture:

```txt
Frontend static export
-> Supabase Auth
-> Supabase Postgres
-> Supabase Realtime
```

Future final state:

- No direct MySQL usage
- No local database dependency
- No `aqua` dependency
- No `aqualogs` dependency
- No filesystem auth
- No Node.js API route dependency for static InfinityFree hosting

## Current MySQL Entry Point

Current low-level database connection:

```txt
src/lib/db.ts
```

This file creates two MySQL pools:

- `queryMain` for `DB_NAME`, currently `aqua`
- `queryLogs` for `LOGS_DB_NAME`, currently `aqualogs`

Current legacy data adapter:

```txt
src/lib/legacy-db-data.ts
```

All current MySQL reads should stay isolated here until they are replaced by Supabase queries.

## Files Importing MySQL Directly

Current direct import of `src/lib/db.ts`:

```txt
src/lib/legacy-db-data.ts
```

API routes now call `src/lib/legacy-db-data.ts` instead of importing `src/lib/db.ts` directly.

## Current API Routes Depending On MySQL Data

These routes still depend on MySQL through the legacy adapter:

```txt
src/app/api/players/route.ts
src/app/api/vehicles/route.ts
src/app/api/businesses/route.ts
src/app/api/fractions/route.ts
src/app/api/logs/route.ts
src/app/api/map/blips/route.ts
```

These routes can be removed later when pages read from Supabase directly:

```txt
/api/players
/api/vehicles
/api/businesses
/api/fractions
/api/logs
/api/map/blips
```

## Pages Depending On MySQL API Routes

```txt
src/app/panel/players/page.tsx -> /api/players
src/app/panel/vehicles/page.tsx -> /api/vehicles
src/app/panel/businesses/page.tsx -> /api/businesses
src/app/panel/fractions/page.tsx -> /api/fractions
src/app/panel/logs/page.tsx -> /api/logs
src/app/panel/map/page.tsx -> /api/map/blips
```

## Current aqua Queries

From `src/lib/legacy-db-data.ts`:

```sql
SELECT uuid, firstname, lastname, fraction, money, bank, adminlvl
FROM characters
WHERE deleted = 0
ORDER BY uuid DESC
LIMIT 300;

SELECT idkey as id, model, number
FROM vehicles
WHERE isdeleted = 0
ORDER BY idkey DESC
LIMIT 300;

SELECT id, name, enterpoint, blipPosition
FROM businesses
ORDER BY id ASC;

SELECT id, money, fuellimit, fuelleft
FROM fractions
ORDER BY id ASC;

SELECT fractionid, position
FROM fractionstock
ORDER BY id ASC;

SELECT id, name, blipPosition, enterpoint
FROM businesses
ORDER BY id ASC;

SELECT id, fractionid, position
FROM fractionstock
ORDER BY id ASC;
```

## Current aqualogs Queries

From `src/lib/legacy-db-data.ts`:

```sql
SELECT id, time, fromtype, `from`, totype, `to`, amount, tax, comment
FROM newmoneylog
ORDER BY id DESC
LIMIT ?;

SELECT idkey as id, time, killer, victim, weapon
FROM killog
ORDER BY idkey DESC
LIMIT ?;

SELECT idkey as id, time, admin, text
FROM adminlog
ORDER BY idkey DESC
LIMIT ?;
```

## Future Supabase Replacements

Suggested future Supabase tables/views:

- `players` or `characters`
- `vehicles`
- `businesses`
- `factions`
- `fraction_stock`
- `server_logs`
- `map_blips` view

Pages should later read from Supabase client helpers instead of `/api/*`:

```txt
src/lib/supabase/*
```

## Recommended Migration Order

1. Keep current MySQL API routes working.
2. Create Supabase schema and Row Level Security policies.
3. Add Supabase read helpers beside the legacy adapter.
4. Migrate low-risk read-only pages first:
   - Businesses
   - Fractions
   - Vehicles
   - Map blips
5. Migrate Players after the Supabase data model is confirmed.
6. Migrate Logs after audit/log schema is finalized.
7. Remove `/api/*` data routes after all pages use Supabase.
8. Remove `src/lib/db.ts`, `mysql2`, and MySQL env vars.
9. Prepare static export for InfinityFree.

## Risks During Migration

- Supabase anon key is public, so Row Level Security must be correct before client-side reads.
- Current MySQL table names and column names may not match the final Supabase schema.
- Logs may need normalization before moving to Supabase.
- Static hosting cannot protect secrets or run server-only code.
- Future RAGE:MP actions must use trusted backend infrastructure, not static frontend code.

## Do Not Remove Yet

Do not remove these until the Supabase data path is fully working:

```txt
src/app/api/*
src/lib/db.ts
src/lib/legacy-db-data.ts
mysql2 dependency
DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME / LOGS_DB_NAME env vars
```
