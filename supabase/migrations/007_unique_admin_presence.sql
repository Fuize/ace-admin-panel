-- ACE Admin Panel unique presence per admin.
-- Draft only: review and apply manually in Supabase SQL Editor.

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
on public.admin_presence (admin_id);

comment on index public.admin_presence_one_row_per_admin_idx is 'Ensures one presence row per admin so refresh/reconnect updates instead of duplicating online users.';
