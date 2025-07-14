-- Add device_token field to profiles for Expo push notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS device_token text;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_device_token ON public.profiles(device_token) WHERE device_token IS NOT NULL;