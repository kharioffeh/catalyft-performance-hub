
-- Migration: 20240615_add_athlete_testing.sql
-- Add athlete testing table for ARIA program generation

CREATE TABLE IF NOT EXISTS public.athlete_testing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_uuid uuid REFERENCES public.athletes(id) ON DELETE CASCADE,
  test_date date NOT NULL DEFAULT CURRENT_DATE,
  lift text,
  one_rm_kg numeric,
  cmj_cm numeric,
  sprint_10m_s numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add comments for future developers
COMMENT ON TABLE public.athlete_testing IS 'Optional athlete testing data for ARIA program generation. Stores strength, power, and speed metrics.';
COMMENT ON COLUMN public.athlete_testing.lift IS 'Exercise name for 1RM test (e.g., Back Squat, Deadlift)';
COMMENT ON COLUMN public.athlete_testing.one_rm_kg IS 'One repetition maximum in kilograms';
COMMENT ON COLUMN public.athlete_testing.cmj_cm IS 'Countermovement jump height in centimeters';
COMMENT ON COLUMN public.athlete_testing.sprint_10m_s IS '10-meter sprint time in seconds';

-- Enable RLS
ALTER TABLE public.athlete_testing ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for coaches to access their athletes' testing data
CREATE POLICY "Coaches can view their athletes testing data" 
  ON public.athlete_testing 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a 
      WHERE a.id = athlete_testing.athlete_uuid 
      AND a.coach_uuid = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert their athletes testing data" 
  ON public.athlete_testing 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athletes a 
      WHERE a.id = athlete_testing.athlete_uuid 
      AND a.coach_uuid = auth.uid()
    )
  );

CREATE POLICY "Coaches can update their athletes testing data" 
  ON public.athlete_testing 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a 
      WHERE a.id = athlete_testing.athlete_uuid 
      AND a.coach_uuid = auth.uid()
    )
  );

CREATE POLICY "Coaches can delete their athletes testing data" 
  ON public.athlete_testing 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.athletes a 
      WHERE a.id = athlete_testing.athlete_uuid 
      AND a.coach_uuid = auth.uid()
    )
  );
