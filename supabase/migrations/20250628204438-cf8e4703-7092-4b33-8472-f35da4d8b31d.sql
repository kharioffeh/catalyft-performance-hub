
-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  type         text CHECK (type IN ('digest','reminder','system')),
  title        text NOT NULL,
  body         text NOT NULL,
  read         boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own notifications
CREATE POLICY "Users can read own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to update their own notifications
CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for system to insert notifications
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create view for yesterday's athlete metrics that ARIA will read
CREATE OR REPLACE VIEW public.aria_digest_metrics_v AS
SELECT
  a.coach_uuid,
  a.id as athlete_id,
  a.name as athlete_name,
  jsonb_build_object(
    'athlete_name', a.name,
    'readiness', COALESCE(r.readiness_score, 0),
    'sleep_hours', COALESCE(s.total_sleep_hours, 0),
    'strain', COALESCE(l.daily_load, 0),
    'acwr', COALESCE(l.acwr_7_28, 1.0),
    'latest_session', COALESCE(sess.type, 'none'),
    'session_notes', sess.notes
  ) as metrics
FROM public.athletes a
LEFT JOIN public.vw_readiness_rolling r ON (
  r.athlete_uuid = a.id 
  AND r.day = (CURRENT_DATE - INTERVAL '1 day')
)
LEFT JOIN public.vw_sleep_daily s ON (
  s.athlete_uuid = a.id 
  AND s.day = (CURRENT_DATE - INTERVAL '1 day')
)
LEFT JOIN public.vw_load_acwr l ON (
  l.athlete_uuid = a.id 
  AND l.day = (CURRENT_DATE - INTERVAL '1 day')
)
LEFT JOIN LATERAL (
  SELECT type, notes
  FROM public.sessions sess_inner
  WHERE sess_inner.athlete_uuid = a.id
    AND sess_inner.start_ts::date = (CURRENT_DATE - INTERVAL '1 day')
  ORDER BY sess_inner.start_ts DESC
  LIMIT 1
) sess ON true
WHERE a.coach_uuid IS NOT NULL;

-- Grant permissions
GRANT SELECT ON public.notifications TO authenticated;
GRANT INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT ON public.aria_digest_metrics_v TO authenticated, service_role;
