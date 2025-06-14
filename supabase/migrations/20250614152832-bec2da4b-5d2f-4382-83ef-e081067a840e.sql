
-- Allow coaches to select (view) only their own sessions

CREATE POLICY "Coaches can view their sessions"
  ON public.sessions
  FOR SELECT
  USING (
    coach_uuid IN (
      SELECT c.id
      FROM public.coaches c
      JOIN public.profiles p ON c.email = p.email
      WHERE p.id = auth.uid()
    )
  );
