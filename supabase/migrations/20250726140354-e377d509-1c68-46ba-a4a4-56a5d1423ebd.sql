-- Add onboarding completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX idx_profiles_onboarding ON public.profiles(has_completed_onboarding);

-- Set existing users to have completed onboarding (since they're already using the app)
UPDATE public.profiles 
SET has_completed_onboarding = true 
WHERE role IS NOT NULL;