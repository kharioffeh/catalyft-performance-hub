-- PR Engine Migration
-- Creates pr_records table and ensures metrics table exists

BEGIN;

-- Create metrics table if it doesn't exist (as described in the task)
CREATE TABLE IF NOT EXISTS public.metrics (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise TEXT NOT NULL,
  weight NUMERIC(6,2),
  reps INTEGER,
  velocity NUMERIC(6,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date, exercise)
);

-- Create pr_records table
CREATE TABLE IF NOT EXISTS public.pr_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('1rm', '3rm', 'velocity')),
  value NUMERIC(8,3) NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, exercise, type)
);

-- Enable Row Level Security
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for metrics
CREATE POLICY "Users can view own metrics" 
ON public.metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" 
ON public.metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" 
ON public.metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for pr_records
CREATE POLICY "Users can view own pr_records" 
ON public.pr_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pr_records" 
ON public.pr_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage pr_records" 
ON public.pr_records 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_user_date ON public.metrics (user_id, date);
CREATE INDEX IF NOT EXISTS idx_metrics_exercise ON public.metrics (exercise);
CREATE INDEX IF NOT EXISTS idx_pr_records_user_exercise ON public.pr_records (user_id, exercise);
CREATE INDEX IF NOT EXISTS idx_pr_records_type ON public.pr_records (type);

COMMIT;