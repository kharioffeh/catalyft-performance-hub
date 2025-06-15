
-- get_muscle_heatmap.sql
CREATE OR REPLACE FUNCTION public.get_muscle_heatmap(
  athlete_id_in uuid,
  window_days int default 7
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  results jsonb := '[]'::jsonb;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'muscle', muscle,
    'acute', acute_load,
    'chronic', chronic_load,
    'acwr', acwr,
    'zone', CASE 
      WHEN acwr < 0.8 THEN 'Low'
      WHEN acwr <= 1.3 THEN 'Normal'
      ELSE 'High'
    END
  ))
  INTO results
  FROM (
    SELECT
      muscle,
      max(acute_load) AS acute_load,
      max(chronic_load) AS chronic_load,
      max(acwr) AS acwr
    FROM muscle_load_daily
    WHERE athlete_id = athlete_id_in
      AND day >= (CURRENT_DATE - window_days)
    GROUP BY muscle
  ) t;

  RETURN COALESCE(results, '[]'::jsonb);
END;
$$;
