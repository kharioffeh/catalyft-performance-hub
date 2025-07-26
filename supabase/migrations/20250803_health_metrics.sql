-- Health metrics migration for readiness function
-- Adds health metrics columns to existing metrics table or creates a separate health_metrics table

-- First check if we need to add columns to existing metrics table or create new table
-- Since there's an existing metrics table for exercise data, we'll add health metric columns

-- Add health metrics columns to metrics table if they don't exist
ALTER TABLE public.metrics 
ADD COLUMN IF NOT EXISTS hrv_rmssd NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS hr_rest INTEGER,
ADD COLUMN IF NOT EXISTS steps INTEGER,
ADD COLUMN IF NOT EXISTS sleep_min INTEGER,
ADD COLUMN IF NOT EXISTS strain NUMERIC(5,2);

-- Update the primary key constraint to handle both exercise and health metrics
-- Remove the old primary key constraint if it exists for exercise-only metrics
-- and create a more flexible constraint

-- Since we're dealing with both exercise metrics (user_id, date, exercise) 
-- and health metrics (user_id, date), we need to modify the constraint
-- We'll make exercise nullable and use a unique constraint instead

ALTER TABLE public.metrics ALTER COLUMN exercise DROP NOT NULL;

-- Add a unique constraint for health metrics (where exercise is null)
-- and keep the existing constraint for exercise metrics
CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_health_unique 
ON public.metrics (user_id, date) 
WHERE exercise IS NULL;

-- Add check constraint to ensure either exercise data or health data is provided
ALTER TABLE public.metrics 
ADD CONSTRAINT chk_metrics_type 
CHECK (
  (exercise IS NOT NULL AND (weight IS NOT NULL OR reps IS NOT NULL OR velocity IS NOT NULL))
  OR 
  (exercise IS NULL AND (hrv_rmssd IS NOT NULL OR hr_rest IS NOT NULL OR steps IS NOT NULL OR sleep_min IS NOT NULL OR strain IS NOT NULL))
);

-- Add comments for clarity
COMMENT ON COLUMN public.metrics.hrv_rmssd IS 'Heart Rate Variability RMSSD in milliseconds';
COMMENT ON COLUMN public.metrics.hr_rest IS 'Resting heart rate in beats per minute';
COMMENT ON COLUMN public.metrics.steps IS 'Daily step count';
COMMENT ON COLUMN public.metrics.sleep_min IS 'Sleep duration in minutes';
COMMENT ON COLUMN public.metrics.strain IS 'Daily strain score (0-21)';