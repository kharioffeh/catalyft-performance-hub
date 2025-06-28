
-- Phase 1: Database Schema for Weekly Progress Summaries

-- Create weekly_summaries table
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_uuid uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('coach', 'solo')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  summary_md text NOT NULL,
  created_at timestamptz DEFAULT now(),
  delivered boolean DEFAULT false,
  UNIQUE(owner_uuid, period_end)
);

-- Enable RLS for weekly_summaries
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly_summaries
CREATE POLICY "Users can view their own weekly summaries" 
ON public.weekly_summaries 
FOR SELECT 
USING (owner_uuid = auth.uid());

CREATE POLICY "Service role can manage weekly summaries" 
ON public.weekly_summaries 
FOR ALL 
USING (auth.role() = 'service_role');

-- Add weekly summary opt-in column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weekly_summary_opt_in boolean DEFAULT true;

-- Create helper functions for weekly metrics aggregation
CREATE OR REPLACE FUNCTION public.get_weekly_metrics(
  p_athlete_uuid uuid,
  p_start_date date,
  p_end_date date
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_result jsonb := '{}';
  v_readiness_avg numeric;
  v_sleep_avg numeric;
  v_acwr_latest numeric;
  v_strain_latest numeric;
  v_readiness_trend text;
  v_sleep_trend text;
BEGIN
  -- Get average readiness for the week
  SELECT AVG(score) INTO v_readiness_avg
  FROM public.readiness_scores
  WHERE athlete_uuid = p_athlete_uuid
    AND ts::date BETWEEN p_start_date AND p_end_date;

  -- Get average sleep for the week
  SELECT AVG(total_sleep_hours) INTO v_sleep_avg
  FROM public.vw_sleep_daily
  WHERE athlete_uuid = p_athlete_uuid
    AND day BETWEEN p_start_date AND p_end_date;

  -- Get latest ACWR
  SELECT acwr_7_28 INTO v_acwr_latest
  FROM public.vw_load_acwr
  WHERE athlete_uuid = p_athlete_uuid
    AND day <= p_end_date
  ORDER BY day DESC
  LIMIT 1;

  -- Get latest strain from sessions
  SELECT strain INTO v_strain_latest
  FROM public.sessions
  WHERE athlete_uuid = p_athlete_uuid
    AND start_ts::date <= p_end_date
    AND strain IS NOT NULL
  ORDER BY start_ts DESC
  LIMIT 1;

  -- Calculate readiness trend (simplified)
  SELECT CASE 
    WHEN AVG(CASE WHEN ts::date >= p_end_date - 2 THEN score END) > 
         AVG(CASE WHEN ts::date <= p_start_date + 2 THEN score END) THEN 'improving'
    WHEN AVG(CASE WHEN ts::date >= p_end_date - 2 THEN score END) < 
         AVG(CASE WHEN ts::date <= p_start_date + 2 THEN score END) THEN 'declining'
    ELSE 'stable'
  END INTO v_readiness_trend
  FROM public.readiness_scores
  WHERE athlete_uuid = p_athlete_uuid
    AND ts::date BETWEEN p_start_date AND p_end_date;

  -- Calculate sleep trend (simplified)
  SELECT CASE 
    WHEN AVG(CASE WHEN day >= p_end_date - 2 THEN total_sleep_hours END) > 
         AVG(CASE WHEN day <= p_start_date + 2 THEN total_sleep_hours END) THEN 'improving'
    WHEN AVG(CASE WHEN day >= p_end_date - 2 THEN total_sleep_hours END) < 
         AVG(CASE WHEN day <= p_start_date + 2 THEN total_sleep_hours END) THEN 'declining'
    ELSE 'stable'
  END INTO v_sleep_trend
  FROM public.vw_sleep_daily
  WHERE athlete_uuid = p_athlete_uuid
    AND day BETWEEN p_start_date AND p_end_date;

  -- Build result JSON
  v_result := jsonb_build_object(
    'readiness_avg', COALESCE(v_readiness_avg, 0),
    'sleep_avg', COALESCE(v_sleep_avg, 0),
    'acwr_latest', COALESCE(v_acwr_latest, 0),
    'strain_latest', COALESCE(v_strain_latest, 0),
    'readiness_trend', COALESCE(v_readiness_trend, 'stable'),
    'sleep_trend', COALESCE(v_sleep_trend, 'stable')
  );

  RETURN v_result;
END;
$$;

-- Function to get active athletes for a coach
CREATE OR REPLACE FUNCTION public.get_active_athletes_for_coach(
  p_coach_uuid uuid
) RETURNS TABLE(
  athlete_uuid uuid,
  athlete_name text
)
LANGUAGE sql
AS $$
  SELECT a.id, a.name
  FROM public.athletes a
  JOIN public.athlete_invites ai ON a.coach_uuid = ai.coach_uuid
  WHERE a.coach_uuid = p_coach_uuid
    AND ai.status = 'accepted'
    AND ai.accepted_at > NOW() - INTERVAL '90 days';
$$;

-- Function to check if user should receive weekly summary
CREATE OR REPLACE FUNCTION public.should_send_weekly_summary(
  p_user_uuid uuid
) RETURNS boolean
LANGUAGE sql
AS $$
  SELECT COALESCE(weekly_summary_opt_in, true)
  FROM public.profiles
  WHERE id = p_user_uuid;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.weekly_summaries TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_metrics(uuid, date, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_active_athletes_for_coach(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.should_send_weekly_summary(uuid) TO service_role;
