-- Create session_adjustments table for aria-adjust-program
-- This table logs when sessions are automatically adjusted based on ACWR and readiness

CREATE TABLE IF NOT EXISTS public.session_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar NOT NULL, -- Can reference program_sessions or other session tables
  athlete_uuid uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason varchar NOT NULL CHECK (reason IN ('low_readiness', 'high_acwr')),
  old_load numeric,
  new_load numeric,
  adjustment_factor numeric NOT NULL DEFAULT 1.0,
  old_status varchar NOT NULL,
  new_status varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for session_adjustments
ALTER TABLE public.session_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policy for coaches to view adjustments for their athletes
CREATE POLICY "Coaches can view athlete session adjustments" 
ON public.session_adjustments 
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
CREATE POLICY "Athletes can view own session adjustments" 
ON public.session_adjustments 
FOR SELECT 
USING (athlete_uuid = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_session_adjustments_athlete_uuid ON public.session_adjustments(athlete_uuid);
CREATE INDEX IF NOT EXISTS idx_session_adjustments_session_id ON public.session_adjustments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_adjustments_created_at ON public.session_adjustments(created_at);

-- Grant permissions
GRANT SELECT, INSERT ON public.session_adjustments TO authenticated;
GRANT SELECT, INSERT ON public.session_adjustments TO service_role;