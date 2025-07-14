-- Add status column to session table if it doesn't exist
ALTER TABLE public.session ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled';

-- Add check constraint to ensure valid status values
ALTER TABLE public.session 
ADD CONSTRAINT IF NOT EXISTS session_status_check 
CHECK (status IN ('scheduled', 'in-progress', 'completed'));

-- Update existing sessions to have 'scheduled' status if null
UPDATE public.session 
SET status = 'scheduled' 
WHERE status IS NULL;