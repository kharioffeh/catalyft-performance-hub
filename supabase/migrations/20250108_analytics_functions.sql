-- Analytics Functions Migration
-- Creates SQL functions for getAnalytics Edge Function

BEGIN;

-- 1. Function to get tonnage data (daily sum of weight × reps)
CREATE OR REPLACE FUNCTION public.get_tonnage_data(user_id UUID)
RETURNS TABLE (
  date DATE,
  tonnage NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    date_trunc('day', ws.created_at)::date AS date,
    SUM(ws.weight * ws.reps) AS tonnage
  FROM workout_sets ws
  JOIN workout_sessions s ON s.id = ws.session_id
  WHERE s.user_id = user_id
  GROUP BY 1
  ORDER BY 1;
$$;

-- 2. Function to get e1RM curve data
CREATE OR REPLACE FUNCTION public.get_e1rm_data(user_id UUID)
RETURNS TABLE (
  exercise TEXT,
  date DATE,
  e1rm NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    exercise,
    achieved_at::date AS date,
    value AS e1rm
  FROM pr_records
  WHERE user_id = get_e1rm_data.user_id 
    AND type = '1rm'
  ORDER BY date;
$$;

-- 3. Function to get velocity-fatigue data
-- Note: Since load_percent is in planned sessions but velocity is in workout_sets,
-- we'll compute a simplified version using workout data only for now
CREATE OR REPLACE FUNCTION public.get_velocity_fatigue_data(user_id UUID)
RETURNS TABLE (
  date DATE,
  avg_velocity NUMERIC,
  max_load NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH daily AS (
    SELECT
      date_trunc('day', ws.created_at)::date AS date,
      AVG(ws.velocity) AS avg_velocity,
      MAX(ws.weight) AS max_load
    FROM workout_sets ws
    JOIN workout_sessions s ON s.id = ws.session_id
    WHERE s.user_id = get_velocity_fatigue_data.user_id
      AND ws.velocity IS NOT NULL
    GROUP BY 1
  )
  SELECT 
    date, 
    avg_velocity, 
    max_load AS max_load
  FROM daily
  ORDER BY date;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_tonnage_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_e1rm_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_velocity_fatigue_data(UUID) TO authenticated;

COMMIT;