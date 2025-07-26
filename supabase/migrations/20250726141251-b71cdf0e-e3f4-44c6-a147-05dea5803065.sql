-- Phase 1: Critical Database Security Fixes
-- Fix all database functions to use proper search_path settings

-- Update existing functions to use proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    COALESCE(new.raw_user_meta_data ->> 'role', 'athlete')
  );
  
  -- If this is an athlete being created, mark any pending invites as accepted
  -- and create athlete record
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_billing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert billing record with 30-day trial and default plan
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
$$;

CREATE OR REPLACE FUNCTION public.handle_athlete_profile_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- If role is being set to 'athlete', mark any pending invites as accepted
  IF NEW.role = 'athlete' AND (OLD.role IS NULL OR OLD.role != 'athlete') THEN
    UPDATE public.athlete_invites 
    SET status = 'accepted', accepted_at = now()
    WHERE lower(email) = lower(NEW.email) 
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_add_athlete_enhanced(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  billing_record RECORD;
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get billing information
  SELECT 
    bc.*,
    p.max_athletes,
    p.type as plan_type
  INTO billing_record
  FROM public.billing_customers bc
  JOIN public.plans p ON bc.plan_id = p.id
  WHERE bc.id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Solo plans have unlimited athletes
  IF billing_record.plan_type = 'solo' THEN
    RETURN true;
  END IF;
  
  -- Calculate total allowed athletes (base + purchased)
  max_allowed = billing_record.max_athletes + billing_record.additional_athletes_purchased;
  
  -- Get current athlete count
  SELECT COUNT(*) INTO current_count
  FROM public.athletes a
  WHERE a.coach_uuid IN (
    SELECT c.id FROM public.coaches c 
    JOIN public.profiles p ON c.email = p.email 
    WHERE p.id = user_uuid
  );
  
  RETURN current_count < max_allowed;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_athlete_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM public.athletes a
  JOIN public.coaches c ON a.coach_uuid = c.id
  JOIN public.profiles p ON c.email = p.email
  WHERE p.id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.fn_can_call_aria()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  UPDATE public.athlete_invites
    SET status = 'expired'
    WHERE status = 'pending'
      AND created_at < now() - interval '14 days';
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_coach()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_coach_secure()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'coach'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_coach_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'coach';
$$;

CREATE OR REPLACE FUNCTION public.user_owns_athlete(athlete_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.athletes a
    JOIN public.coaches c ON a.coach_uuid = c.id
    WHERE a.id = athlete_id AND c.email = auth.email()
  );
$$;