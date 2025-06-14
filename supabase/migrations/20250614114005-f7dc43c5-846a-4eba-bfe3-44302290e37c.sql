
-- 1. Update (or create) helper functions to rely on `profiles` as source of truth for roles.
CREATE OR REPLACE FUNCTION public.is_current_user_coach()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'coach'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_coach_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'coach';
$$;

-- 2. Remove any existing RLS policies for clarity (if any; safer to drop if you’re unsure):
DROP POLICY IF EXISTS "Allow coach insert own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach read sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow coach delete sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow athlete view own sessions" ON public.sessions;

-- 3. Enable RLS on sessions if not enabled
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 4. Coaches can INSERT only their own sessions (when logged in as coach)
CREATE POLICY "Allow coach insert own sessions"
  ON public.sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_current_user_coach() AND coach_uuid = auth.uid()
  );

-- 5a. Coaches can SELECT their own sessions
CREATE POLICY "Allow coach read sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (
    public.is_current_user_coach() AND coach_uuid = auth.uid()
  );

-- 5b. Coaches can UPDATE their own sessions
CREATE POLICY "Allow coach update sessions"
  ON public.sessions
  FOR UPDATE
  TO authenticated
  USING (
    public.is_current_user_coach() AND coach_uuid = auth.uid()
  );

-- 5c. Coaches can DELETE their own sessions
CREATE POLICY "Allow coach delete sessions"
  ON public.sessions
  FOR DELETE
  TO authenticated
  USING (
    public.is_current_user_coach() AND coach_uuid = auth.uid()
  );

-- 6. Athletes can SELECT (view) their own sessions
CREATE POLICY "Allow athlete view own sessions"
  ON public.sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'athlete'
    )
    AND athlete_uuid = auth.uid()
  );
