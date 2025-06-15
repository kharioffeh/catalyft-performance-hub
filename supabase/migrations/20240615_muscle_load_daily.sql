
-- Migration: m20240615_muscle_load_daily.sql
CREATE TABLE IF NOT EXISTS public.muscle_load_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES public.athletes(id) ON DELETE CASCADE,
  day date NOT NULL,
  muscle text NOT NULL, -- e.g. "biceps", "rectus_femoris"
  acute_load numeric,   -- 7d sum or EWMA
  chronic_load numeric, -- 28d sum or EWMA
  acwr numeric,         -- acute:chronic ratio
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_muscle_load_athlete_day ON public.muscle_load_daily (athlete_id, day, muscle);

COMMENT ON TABLE public.muscle_load_daily IS 'Stores per-muscle load aggregates for athlete, for heatmap coloring.';

ALTER TABLE public.muscle_load_daily ENABLE ROW LEVEL SECURITY;

-- RLS: coaches can see their athlete's muscle load
CREATE POLICY "Coaches may select muscle_load_daily for their athletes"
  ON public.muscle_load_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a
      WHERE a.id = muscle_load_daily.athlete_id
      AND a.coach_uuid = auth.uid()
    )
  );
