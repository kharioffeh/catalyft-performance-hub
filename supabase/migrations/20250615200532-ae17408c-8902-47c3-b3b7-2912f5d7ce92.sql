
-- 1. Create muscle_load_daily table to store load per muscle per athlete per day
CREATE TABLE IF NOT EXISTS public.muscle_load_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athletes(id) ON DELETE CASCADE,
  day date NOT NULL,
  muscle text NOT NULL, -- e.g. "biceps", "rectus_femoris"
  acute_load numeric,
  chronic_load numeric,
  acwr numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_muscle_load_athlete_day ON public.muscle_load_daily (athlete_id, day, muscle);

COMMENT ON TABLE public.muscle_load_daily IS 'Stores per-muscle load aggregates for athlete, for heatmap coloring.';

-- 2. Create lookup_exercise_muscle table for exercise-to-muscle mapping
CREATE TABLE IF NOT EXISTS public.lookup_exercise_muscle (
  id serial PRIMARY KEY,
  exercise_name text NOT NULL,
  muscles text[] NOT NULL -- e.g. ARRAY['biceps','latissimus_dorsi']
);

COMMENT ON TABLE public.lookup_exercise_muscle IS 'Maps canonical exercise names to primary/secondary muscles.';

-- 3. Populate lookup_exercise_muscle with a few sample exercises and muscles
INSERT INTO public.lookup_exercise_muscle (exercise_name, muscles) VALUES
  ('Back Squat', ARRAY['rectus_femoris','vastus_lateralis','gluteus_maximus','erector_spinae']),
  ('Bench Press', ARRAY['pectoralis_major','triceps_brachii','anterior_deltoid']),
  ('Deadlift', ARRAY['gluteus_maximus','hamstrings','erector_spinae','trapezius']),
  ('Pull-Up', ARRAY['latissimus_dorsi','biceps_brachii','rhomboids'])
ON CONFLICT DO NOTHING;

-- 4. Create get_muscle_heatmap RPC to produce muscle heatmap JSON for a given athlete and period
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

-- 5. Add Row Level Security allowing coaches to read muscle_load_daily for their athletes
ALTER TABLE public.muscle_load_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches may select muscle_load_daily for their athletes"
  ON public.muscle_load_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.id = muscle_load_daily.athlete_id
      AND a.coach_uuid = auth.uid()
    )
  );

-- 6. [OPTIONAL] Insert some sample muscle_load_daily data for testing (athlete UUID must be in your athletes table to see color)
-- Example (replace 'SOME-ATHLETE-UUID' with your actual athlete id):
-- INSERT INTO public.muscle_load_daily (athlete_id, day, muscle, acute_load, chronic_load, acwr)
-- VALUES
--   ('SOME-ATHLETE-UUID', CURRENT_DATE, 'rectus_femoris', 20, 25, 0.8),
--   ('SOME-ATHLETE-UUID', CURRENT_DATE, 'latissimus_dorsi', 15, 17, 0.88);

