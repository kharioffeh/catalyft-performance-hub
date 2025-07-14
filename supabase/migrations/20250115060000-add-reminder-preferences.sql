-- Add reminder preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_frequency_minutes integer DEFAULT 60;

-- Add constraint to ensure reasonable reminder frequencies (5 minutes to 24 hours)
ALTER TABLE public.profiles 
ADD CONSTRAINT reminder_frequency_check 
CHECK (reminder_frequency_minutes >= 5 AND reminder_frequency_minutes <= 1440);

-- Add index for efficient lookups of users with reminders enabled
CREATE INDEX IF NOT EXISTS idx_profiles_reminder_enabled 
ON public.profiles(reminder_enabled) 
WHERE reminder_enabled = true;