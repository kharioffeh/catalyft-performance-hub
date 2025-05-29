
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule ARIA insights generation to run every hour
SELECT cron.schedule(
  'aria-insights-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria_generate_insights',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
