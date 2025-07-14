
-- Schedule ARIA program adjustment function to run daily at 5 AM
-- This enables proactive session adjustments based on athlete readiness and ACWR

-- Schedule the function to run daily at 5 AM
SELECT cron.schedule(
  'aria-adjust-program',
  '0 5 * * *', -- Every day at 5 AM
  $$
  SELECT
    net.http_post(
        url:='https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria-adjust-program',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule if needed:
-- SELECT cron.unschedule('aria-adjust-program');
