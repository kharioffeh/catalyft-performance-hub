-- Create pr_records table for personal records
CREATE TABLE public.pr_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_uuid UUID NOT NULL,
  exercise TEXT NOT NULL,
  pr_type TEXT NOT NULL CHECK (pr_type IN ('1rm', '3rm', 'velocity')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  achieved_at DATE NOT NULL,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX idx_pr_records_athlete_exercise ON public.pr_records(athlete_uuid, exercise);
CREATE INDEX idx_pr_records_achieved_at ON public.pr_records(achieved_at);

-- Enable Row Level Security
ALTER TABLE public.pr_records ENABLE ROW LEVEL SECURITY;

-- Create policies for pr_records
CREATE POLICY "Athletes can view their own PRs" 
ON public.pr_records 
FOR SELECT 
USING (athlete_uuid = auth.uid());

CREATE POLICY "Athletes can insert their own PRs" 
ON public.pr_records 
FOR INSERT 
WITH CHECK (athlete_uuid = auth.uid());

CREATE POLICY "Athletes can update their own PRs" 
ON public.pr_records 
FOR UPDATE 
USING (athlete_uuid = auth.uid());

CREATE POLICY "Athletes can delete their own PRs" 
ON public.pr_records 
FOR DELETE 
USING (athlete_uuid = auth.uid());

-- Coaches can view PRs for their athletes
CREATE POLICY "Coaches can view PRs for their athletes" 
ON public.pr_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.athletes a
  WHERE a.id = pr_records.athlete_uuid 
  AND a.coach_uuid = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_pr_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pr_records_updated_at
  BEFORE UPDATE ON public.pr_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pr_records_updated_at();