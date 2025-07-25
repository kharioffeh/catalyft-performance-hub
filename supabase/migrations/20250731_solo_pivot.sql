-- Solo Pivot Migration: Drop coach tables & foreign keys
-- This migration removes the coach/athlete flow entirely

-- 1. Drop coach-specific tables (cascade to dependent views/FKs)
DROP TABLE IF EXISTS athletes CASCADE;
DROP TABLE IF EXISTS coach_billings CASCADE;
DROP TABLE IF EXISTS invite_tokens CASCADE;

-- 2. Remove coach_id column from programs (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='programs' AND column_name='coach_id'
  ) THEN
    ALTER TABLE programs DROP COLUMN coach_id;
  END IF;
END;
$$;

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

-- 4. Remove coach_uuid from sessions table if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='sessions' AND column_name='coach_uuid'
  ) THEN
    ALTER TABLE sessions DROP COLUMN coach_uuid;
  END IF;
END;
$$;

-- 5. Disable or delete RLS policies that reference coach_id
-- Drop all coach-related policies on sessions
DROP POLICY IF EXISTS "Allow coach insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow coach read sessions" ON sessions;
DROP POLICY IF EXISTS "Allow coach update sessions" ON sessions;
DROP POLICY IF EXISTS "Allow coach delete sessions" ON sessions;

-- Drop coach-related policies that might reference athletes table
DROP POLICY IF EXISTS "Coaches can view their athletes testing data" ON testing_data;
DROP POLICY IF EXISTS "Coaches can insert their athletes testing data" ON testing_data;
DROP POLICY IF EXISTS "Coaches can update their athletes testing data" ON testing_data;
DROP POLICY IF EXISTS "Coaches can delete their athletes testing data" ON testing_data;
DROP POLICY IF EXISTS "Coaches may select muscle_load_daily for their athletes" ON muscle_load_daily;
DROP POLICY IF EXISTS "Coaches can view adjustments for their athletes" ON session_adjustments;
DROP POLICY IF EXISTS "Coaches can view their athletes wearable tokens" ON wearable_tokens;

-- Generic policy disable for any remaining coach policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Find and disable any remaining policies that reference 'coach' in their name
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE policyname ILIKE '%coach%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END;
$$;

-- 6. Drop coach-related functions
DROP FUNCTION IF EXISTS public.is_current_user_coach();
DROP FUNCTION IF EXISTS public.get_current_coach_id();
DROP FUNCTION IF EXISTS public.get_active_athletes_for_coach(uuid);

-- 7. Drop any coach-related triggers
DROP TRIGGER IF EXISTS update_athlete_count_trigger ON public.athletes;

-- Note: This migration assumes we're keeping the sessions table but removing coach relationships
-- If sessions table should also be dropped, add: DROP TABLE IF EXISTS sessions CASCADE;