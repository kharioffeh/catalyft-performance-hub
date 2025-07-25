-- Solo Pivot Migration - Remove coach/athlete flow entirely
-- Date: 2025-07-25

-- 1. Drop coach-specific tables (cascade to dependent views/FKs)
DROP TABLE IF EXISTS athletes CASCADE;
DROP TABLE IF EXISTS coach_billings CASCADE;
DROP TABLE IF EXISTS invite_tokens CASCADE;

-- 2. Remove coach_id column from programs
ALTER TABLE programs DROP COLUMN IF EXISTS coach_id;

-- 3. Remove any FK on sessions.coach_id if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='coach_id'
  ) THEN
    ALTER TABLE sessions DROP COLUMN coach_id;
  END IF;
END;
$$;

-- 4. Disable or delete RLS policies that reference coach_id
-- Note: Using ALTER POLICY with false condition to disable rather than drop
-- in case there are dependencies

-- Disable coach-related policies on ai_insights
DROP POLICY IF EXISTS "Allow select if coach or athlete (kai/aria back-compat)" ON public.ai_insights;
DROP POLICY IF EXISTS "Allow insert if coach or athlete (kai/aria back-compat)" ON public.ai_insights;
DROP POLICY IF EXISTS "Allow update if coach or athlete (kai/aria back-compat)" ON public.ai_insights;
DROP POLICY IF EXISTS "Allow delete if coach or athlete (kai/aria back-compat)" ON public.ai_insights;

-- Disable coach-related policies on wearable_tokens
DROP POLICY IF EXISTS "Coaches can view their athletes wearable tokens" ON public.wearable_tokens;

-- Disable coach-related policies on testing_data
DROP POLICY IF EXISTS "Coaches can view their athletes testing data" ON public.testing_data;
DROP POLICY IF EXISTS "Coaches can insert their athletes testing data" ON public.testing_data;
DROP POLICY IF EXISTS "Coaches can update their athletes testing data" ON public.testing_data;
DROP POLICY IF EXISTS "Coaches can delete their athletes testing data" ON public.testing_data;

-- Disable coach-related policies on muscle_load_daily
DROP POLICY IF EXISTS "Coaches may select muscle_load_daily for their athletes" ON public.muscle_load_daily;

-- Disable coach-related policies on sessions
DROP POLICY IF EXISTS "Coaches can insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Coaches can update their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Coaches can delete their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Coaches can view their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach insert own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach read sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach delete sessions" ON public.sessions;

-- Disable coach-related policies on workout_blocks/programs
DROP POLICY IF EXISTS "Coaches can manage athlete programs" ON public.workout_blocks;

-- Disable coach-related policies on session_adjustments
DROP POLICY IF EXISTS "Coaches can view athlete session adjustments" ON public.session_adjustments;
DROP POLICY IF EXISTS "Coaches can view athlete adjustments" ON public.session_adjustments;

-- Drop coach-related functions that are no longer needed
DROP FUNCTION IF EXISTS public.get_user_athlete_count(uuid);
DROP FUNCTION IF EXISTS public.is_current_user_coach();
DROP FUNCTION IF EXISTS public.get_current_coach_id();
DROP FUNCTION IF EXISTS public.user_owns_athlete(uuid);
DROP FUNCTION IF EXISTS public.get_active_athletes_for_coach(uuid);
DROP FUNCTION IF EXISTS public.expire_old_invites();

-- Clean up any coach-related triggers
DROP TRIGGER IF EXISTS update_athlete_count_trigger ON public.athletes;

-- Remove coach-related columns from other tables that may reference coaches
ALTER TABLE exercise_library DROP COLUMN IF EXISTS coach_uuid;
ALTER TABLE workout_blocks DROP COLUMN IF EXISTS coach_uuid;
ALTER TABLE ai_insights DROP COLUMN IF EXISTS coach_uuid;

-- Note: Programs table coach_id column already handled above
-- Note: Sessions table coach_id column already handled above