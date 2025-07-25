-- Critical Security Fixes: Add SET search_path TO '' to SECURITY DEFINER functions
-- Create missing tables first (without RLS on views)

-- Create missing tables that some functions reference
CREATE TABLE IF NOT EXISTS public.workout_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_uuid uuid,
  athlete_uuid uuid,
  name text NOT NULL,
  duration_weeks integer NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_uuid uuid,
  weeks integer,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS only on actual tables (not views)
ALTER TABLE public.workout_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for new tables
CREATE POLICY "Users can manage their own workout blocks" ON public.workout_blocks
FOR ALL USING (athlete_uuid = auth.uid() OR coach_uuid = auth.uid());

CREATE POLICY "Users can manage their own templates" ON public.template
FOR ALL USING (owner_uuid = auth.uid());

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
FOR SELECT USING (user_id = auth.uid());

-- Now fix the SECURITY DEFINER functions by adding SET search_path TO ''

-- Fix get_user_athlete_count function
CREATE OR REPLACE FUNCTION public.get_user_athlete_count(user_uuid uuid)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT COUNT(*)::INTEGER 
  FROM public.athletes a
  JOIN public.coaches c ON a.coach_uuid = c.id
  JOIN public.profiles p ON c.email = p.email
  WHERE p.id = user_uuid;
$function$;

-- Fix core authentication functions
CREATE OR REPLACE FUNCTION public.is_current_user_coach()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_current_coach_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'coach';
$function$;

CREATE OR REPLACE FUNCTION public.user_owns_athlete(athlete_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.athletes a
    JOIN public.coaches c ON a.coach_uuid = c.id
    WHERE a.id = athlete_id AND c.email = auth.email()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_coach_or_athlete(uuid, uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT auth.uid() = $1 OR auth.uid() = $2;
$function$;

-- Fix utility functions
CREATE OR REPLACE FUNCTION public.fn_can_call_aria()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT auth.uid() IS NOT NULL;
$function$;

CREATE OR REPLACE FUNCTION public.expire_old_invites()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  UPDATE public.athlete_invites
    SET status = 'expired'
    WHERE status = 'pending'
      AND created_at < now() - interval '14 days';
$function$;