-- ACE Admin Panel staff chat hourly cleanup.
-- Draft only: review and apply manually in Supabase SQL Editor.
-- Requires the Supabase pg_cron extension to be available for scheduled cleanup.

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

comment on function public.cleanup_old_staff_chat_messages() is 'Deletes staff chat messages older than 1 hour. Does not touch admin_presence.';

revoke all on function public.cleanup_old_staff_chat_messages() from public;

select cron.unschedule('ace_staff_chat_hourly_cleanup')
where exists (
  select 1
  from cron.job
  where jobname = 'ace_staff_chat_hourly_cleanup'
);

select cron.schedule(
  'ace_staff_chat_hourly_cleanup',
  '0 * * * *',
  $$select public.cleanup_old_staff_chat_messages();$$
);
