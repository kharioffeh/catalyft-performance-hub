
-- Create RPC function to get training plan KPIs
CREATE OR REPLACE FUNCTION public.training_plan_kpis()
RETURNS TABLE(templates bigint, active_programs bigint, total_sessions bigint)
SECURITY DEFINER
LANGUAGE sql AS $$
  SELECT
    (SELECT count(*) FROM template WHERE owner_uuid = auth.uid()) as templates,
    (SELECT count(*) FROM program_instance WHERE coach_uuid = auth.uid() AND status = 'active') as active_programs,
    (SELECT count(*) FROM session s 
     JOIN program_instance pi ON s.program_id = pi.id 
     WHERE pi.coach_uuid = auth.uid()) as total_sessions;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.training_plan_kpis() TO authenticated;
