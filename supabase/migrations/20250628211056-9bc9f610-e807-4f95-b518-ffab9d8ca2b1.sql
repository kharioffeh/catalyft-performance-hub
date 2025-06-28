
-- Phase 1: Database Schema Extensions

-- Add notification preferences and timezone to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{"daily_summary":true,"missed_workout":true,"abnormal_readiness":true}',
ADD COLUMN IF NOT EXISTS timezone text;

-- Add meta column and extend notification types
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}';

-- Update notification type constraint to include new types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('digest', 'reminder', 'system', 'daily_summary', 'missed_workout', 'abnormal_readiness'));

-- Add session status tracking columns
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS planned_start timestamp with time zone;

-- Create notification thresholds table for user-configurable alerts
CREATE TABLE IF NOT EXISTS public.notification_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  readiness_threshold numeric DEFAULT 40,
  strain_threshold numeric DEFAULT 18,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for notification thresholds
ALTER TABLE public.notification_thresholds ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own thresholds
CREATE POLICY "Users can manage own notification thresholds" 
ON public.notification_thresholds 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_thresholds TO authenticated;

-- Create function to get user timezone (fallback to UTC)
CREATE OR REPLACE FUNCTION public.get_user_timezone(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(timezone, 'UTC') 
  FROM public.profiles 
  WHERE id = user_uuid;
$$;

-- Create function to check if notification should be sent
CREATE OR REPLACE FUNCTION public.should_send_notification(
  user_uuid uuid,
  notification_kind text
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (notification_prefs ->> notification_kind)::boolean,
    true
  )
  FROM public.profiles 
  WHERE id = user_uuid;
$$;
