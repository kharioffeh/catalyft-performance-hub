
-- Schedule ARIA reminder function to run every 15 minutes
-- This enables proactive notifications for users based on their timezone

-- First, ensure the pg_cron extension is enabled
-- This should be done in the Supabase dashboard under Database > Extensions

-- Schedule the function to run every 15 minutes
SELECT cron.schedule(
  'aria-schedule-reminders',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT
    net.http_post(
        url:='https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria-schedule-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule if needed:
-- SELECT cron.unschedule('aria-schedule-reminders');
