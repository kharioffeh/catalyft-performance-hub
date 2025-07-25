-- Critical Security Fixes: Add SET search_path TO '' to all SECURITY DEFINER functions

-- Fix solo_create_block function
CREATE OR REPLACE FUNCTION public.solo_create_block(p_name text, p_duration_weeks integer, p_block jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_block_id uuid;
BEGIN
  -- Insert the workout block for the authenticated user
  INSERT INTO public.workout_blocks (coach_uuid, athlete_uuid, name, duration_weeks, data)
  VALUES (null, auth.uid(), p_name, p_duration_weeks, p_block)
  RETURNING id INTO v_block_id;
  
  RETURN v_block_id;
END $function$;

-- Fix fn_upsert_exercise function
CREATE OR REPLACE FUNCTION public.fn_upsert_exercise(p_name text, p_category text, p_primary_muscle text, p_secondary_muscle text[] DEFAULT '{}'::text[], p_video_url text DEFAULT NULL::text, p_coach_uuid uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_id uuid;
begin
  select id into v_id
  from public.exercise_library
  where lower(name) = lower(p_name)
    and coalesce(coach_uuid, '00000000-0000-0000-0000-000000000000') = coalesce(p_coach_uuid, '00000000-0000-0000-0000-000000000000')
  limit 1;

  if v_id is null then
    insert into public.exercise_library (name, category, primary_muscle, secondary_muscle, video_url, coach_uuid)
    values (p_name, p_category, p_primary_muscle, p_secondary_muscle, p_video_url, p_coach_uuid)
    returning id into v_id;
  end if;

  return v_id;
end;
$function$;

-- Fix fn_create_program_from_template function
CREATE OR REPLACE FUNCTION public.fn_create_program_from_template(p_template_id uuid, p_athlete uuid, p_coach uuid, p_start_date date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_weeks        int;
  v_program_id   uuid;
  v_session_id   uuid;
  v_day_offset   int;
begin
  -- fetch template meta
  select weeks into v_weeks from public.template where id = p_template_id;

  if v_weeks is null then
    raise exception 'Template % not found', p_template_id;
  end if;

  -- create program_instance
  insert into public.program_instance (
    athlete_uuid, coach_uuid, source, template_id,
    start_date, end_date, status
  ) values (
    p_athlete, p_coach, 'template', p_template_id,
    p_start_date, p_start_date + (v_weeks * 7 - 1), 'active'
  ) returning id into v_program_id;

  -- create session rows
  for v_day_offset in 0 .. (v_weeks * 7 - 1) loop
    insert into public.session (
      program_id, planned_at
    ) values (
      v_program_id, (p_start_date + v_day_offset)
    ) returning id into v_session_id;
  end loop;

  -- hydrate session.exercises JSON
  update public.session s
  set exercises = (
    select jsonb_agg(e.elem) from (
      select jsonb_build_object(
        'exercise_id', exercise_id,
        'sets', sets,
        'reps', reps,
        'load_pct', load_pct
      ) as elem
      from public.v_template_grid g
      where g.template_id = p_template_id
        and ( (g.week_no - 1)*7 + (g.day_no - 1) ) = (s.planned_at::date - p_start_date)
    ) q
  )
  where s.program_id = v_program_id;

  return v_program_id;
end;
$function$;

-- Fix training_plan_kpis function
CREATE OR REPLACE FUNCTION public.training_plan_kpis()
 RETURNS TABLE(templates bigint, active_programs bigint, total_sessions bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT
    (SELECT count(*) FROM public.template WHERE owner_uuid = auth.uid()) as templates,
    (SELECT count(*) FROM public.program_instance WHERE coach_uuid = auth.uid() AND status = 'active') as active_programs,
    (SELECT count(*) FROM public.session s 
     JOIN public.program_instance pi ON s.program_id = pi.id 
     WHERE pi.coach_uuid = auth.uid()) as total_sessions;
$function$;

-- Fix is_coach_or_athlete function
CREATE OR REPLACE FUNCTION public.is_coach_or_athlete(uuid, uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT
    auth.uid() = $1 OR auth.uid() = $2
$function$;

-- Fix is_current_user_coach_secure function
CREATE OR REPLACE FUNCTION public.is_current_user_coach_secure()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'coach'
  );
$function$;

-- Fix handle_new_user_billing function
CREATE OR REPLACE FUNCTION public.handle_new_user_billing()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Fix can_add_athlete_enhanced function
CREATE OR REPLACE FUNCTION public.can_add_athlete_enhanced(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Fix fn_can_call_aria function
CREATE OR REPLACE FUNCTION public.fn_can_call_aria()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT auth.uid() IS NOT NULL;
$function$;

-- Fix handle_athlete_profile_update function
CREATE OR REPLACE FUNCTION public.handle_athlete_profile_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

-- Fix expire_old_invites function
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

-- Fix is_current_user_coach function
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

-- Fix user_owns_athlete function
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

-- Fix get_current_coach_id function
CREATE OR REPLACE FUNCTION public.get_current_coach_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'coach';
$function$;

-- Fix handle_new_user function
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
$function$;

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

-- Fix can_add_athlete function
CREATE OR REPLACE FUNCTION public.can_add_athlete(user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT CASE 
    WHEN sp.athlete_limit IS NULL THEN true -- Unlimited plan
    WHEN get_user_athlete_count(user_uuid) < sp.athlete_limit THEN true
    ELSE false
  END
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid AND us.status = 'active'
  LIMIT 1;
$function$;