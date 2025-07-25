-- Critical Security Fixes: Add SET search_path TO '' to SECURITY DEFINER functions
-- Fix function dependencies by creating missing tables and reordering functions

-- First, create missing tables that some functions reference
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

CREATE TABLE IF NOT EXISTS public.v_template_grid (
  template_id uuid,
  week_no integer,
  day_no integer,
  exercise_id uuid,
  sets integer,
  reps integer,
  load_pct numeric
);

-- Enable RLS on new tables
ALTER TABLE public.workout_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v_template_grid ENABLE ROW LEVEL SECURITY;

-- Now fix the functions in correct dependency order

-- Fix get_user_athlete_count function first (dependency)
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

-- Fix can_add_athlete function (depends on get_user_athlete_count)
CREATE OR REPLACE FUNCTION public.can_add_athlete(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT CASE 
    WHEN sp.athlete_limit IS NULL THEN true -- Unlimited plan
    WHEN public.get_user_athlete_count(user_uuid) < sp.athlete_limit THEN true
    ELSE false
  END
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid AND us.status = 'active'
  LIMIT 1;
$function$;

-- Fix core auth functions
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

-- Fix trigger functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    COALESCE(new.raw_user_meta_data ->> 'role', 'athlete')
  );
  
  -- If this is an athlete being created, mark any pending invites as accepted
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'athlete') = 'athlete' THEN
    -- Update invite status
    UPDATE public.athlete_invites 
    SET status = 'accepted', accepted_at = now()
    WHERE lower(trim(email)) = lower(trim(new.email)) 
      AND status = 'pending';
    
    -- Create athlete record if invite exists
    INSERT INTO public.athletes (id, coach_uuid, name, created_at, updated_at)
    SELECT 
      new.id,
      ai.coach_uuid,
      new.raw_user_meta_data ->> 'full_name',
      now(),
      now()
    FROM public.athlete_invites ai
    WHERE lower(trim(ai.email)) = lower(trim(new.email))
      AND ai.status = 'accepted'
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_billing()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.billing_customers (id, role, plan_id, trial_end, plan_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'solo'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'solo') = 'coach' THEN 'coach_basic'
      ELSE 'solo_basic'
    END,
    NOW() + INTERVAL '30 days',
    'trialing'
  );
  
  RETURN NEW;
END;
$function$;

-- Fix other utility functions
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