
-- Schedule ARIA weekly summary function to run every Monday at 8:00 AM UTC
-- This will generate and send weekly performance summaries to coaches and solo athletes

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule the function to run every Monday at 8:00 AM UTC
SELECT cron.schedule(
  'aria-weekly-summary',
  '0 8 * * 1', -- Every Monday at 8:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria_weekly_summary',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk"}'::jsonb,
        body:='{"debug": false}'::jsonb
    ) as request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job WHERE jobname = 'aria-weekly-summary';

-- To unschedule if needed:
-- SELECT cron.unschedule('aria-weekly-summary');
