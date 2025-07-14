-- Add title column to session table to store block name
ALTER TABLE public.session ADD COLUMN IF NOT EXISTS title text;

-- Set default title for existing sessions without title
UPDATE public.session 
SET title = 'Training Session' 
WHERE title IS NULL;

-- Add default constraint
ALTER TABLE public.session ALTER COLUMN title SET DEFAULT 'Training Session';