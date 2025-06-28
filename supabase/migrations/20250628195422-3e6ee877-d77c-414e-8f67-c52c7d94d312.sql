
-- ARIA Bootstrap: Database helper function for RLS policies
-- This creates a simple authentication check that can be used across ARIA-related tables

CREATE OR REPLACE FUNCTION public.fn_can_call_aria()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Comment: This function will be used in future RLS policies for ARIA-related tables
-- It provides a centralized way to check if a user is authenticated and can access ARIA features
