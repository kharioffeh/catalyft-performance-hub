
-- Phase 1: Database Schema Extensions for Adaptive Program Adjustment

-- Create adjustment reason enum
CREATE TYPE adjustment_reason AS ENUM (
  'low_readiness',
  'high_readiness', 
  'over_strain',
  'under_strain'
);

-- Create program adjustments table
CREATE TABLE IF NOT EXISTS public.program_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions ON DELETE CASCADE,
  athlete_uuid uuid NOT NULL,
  reason adjustment_reason NOT NULL,
  old_payload jsonb NOT NULL,
  new_payload jsonb NOT NULL,
  adjustment_factor numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for program adjustments
ALTER TABLE public.program_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policy for coaches to view adjustments for their athletes
CREATE POLICY "Coaches can view athlete adjustments" 
ON public.program_adjustments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.athletes a 
    JOIN public.coaches c ON a.coach_uuid = c.id 
    JOIN public.profiles p ON c.email = p.email 
    WHERE a.id = athlete_uuid AND p.id = auth.uid()
  )
);

-- Create policy for athletes to view their own adjustments
CREATE POLICY "Athletes can view own adjustments" 
ON public.program_adjustments 
FOR SELECT 
USING (athlete_uuid = auth.uid());

-- Add payload column to sessions table if it doesn't exist
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}';

-- Add last readiness and strain columns to profiles for caching
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_readiness numeric,
ADD COLUMN IF NOT EXISTS last_strain numeric,
ADD COLUMN IF NOT EXISTS last_metrics_update timestamptz;

-- Create function to update athlete metrics cache
CREATE OR REPLACE FUNCTION public.update_athlete_metrics_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update last readiness scores
  UPDATE public.profiles p
  SET 
    last_readiness = rs.score,
    last_metrics_update = now()
  FROM (
    SELECT DISTINCT ON (athlete_uuid) 
      athlete_uuid, 
      score
    FROM public.readiness_scores 
    ORDER BY athlete_uuid, ts DESC
  ) rs
  WHERE p.id = rs.athlete_uuid;

  -- Update last strain from sessions
  UPDATE public.profiles p
  SET last_strain = s.strain
  FROM (
    SELECT DISTINCT ON (athlete_uuid)
      athlete_uuid,
      strain
    FROM public.sessions
    WHERE strain IS NOT NULL
    ORDER BY athlete_uuid, start_ts DESC
  ) s
  WHERE p.id = s.athlete_uuid;
END;
$$;

-- Add adaptive_adjustments feature to plans table
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS adaptive_adjustments boolean DEFAULT false;

-- Update existing plans with adaptive adjustments feature
UPDATE public.plans 
SET adaptive_adjustments = true 
WHERE id IN ('coach_basic', 'coach_pro', 'solo_pro');

-- Grant permissions
GRANT SELECT, INSERT ON public.program_adjustments TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_athlete_metrics_cache() TO service_role;
