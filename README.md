# Admin Panel (DB + GTA Live Map)

## Run
1) Copy `.env.example` -> `.env.local` (DB_PASSWORD can stay empty)
2) `npm install`
3) In DB `aqua`, run `sql/admin_users.sql`
4) Create password hash: `npm run hash -- 123456`
5) Insert user into `admin_users` with that hash
6) `npm run dev`

## GTA Map
Map uses `public/gta-map.png` (already included).
"# AceAdminPanel" 
