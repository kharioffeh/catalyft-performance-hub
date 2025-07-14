-- Schedule pull-whoop-recovery to run daily at 06:00 UTC
insert into supabase_functions.cron (name, schedule)
values ('pull-whoop-recovery', '0 6 * * *');