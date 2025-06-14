
-- Enable Row Level Security on the sessions table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow coaches to insert sessions if the coach_uuid matches their coach profile
CREATE POLICY "Coaches can insert sessions"
  ON public.sessions
  FOR INSERT
  WITH CHECK (
    coach_uuid IN (
      SELECT c.id
      FROM public.coaches c
      JOIN public.profiles p ON c.email = p.email
      WHERE p.id = auth.uid()
    )
  );

-- Allow coaches to update their own sessions
CREATE POLICY "Coaches can update their sessions"
  ON public.sessions
  FOR UPDATE
  USING (
    coach_uuid IN (
      SELECT c.id
      FROM public.coaches c
      JOIN public.profiles p ON c.email = p.email
      WHERE p.id = auth.uid()
    )
  );

-- Allow coaches to delete their own sessions
CREATE POLICY "Coaches can delete their sessions"
  ON public.sessions
  FOR DELETE
  USING (
    coach_uuid IN (
      SELECT c.id
      FROM public.coaches c
      JOIN public.profiles p ON c.email = p.email
      WHERE p.id = auth.uid()
    )
  );
