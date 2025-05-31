
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useAthletesDebug = () => {
  const { profile } = useAuth();

  useEffect(() => {
    const debugRLS = async () => {
      if (!profile?.email) return;

      console.log('=== ATHLETES DEBUG ===');
      console.log('Profile:', profile);

      // Test coach lookup
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('*')
        .eq('email', profile.email);

      console.log('Coach lookup:', { coachData, coachError });

      // Test athletes query with explicit filtering
      const { data: athletesData, error: athletesError } = await supabase
        .from('athletes')
        .select('*');

      console.log('Athletes query (no RLS filter):', { athletesData, athletesError });

      // Test with coach filter
      if (coachData && coachData[0]) {
        const { data: filteredAthletes, error: filteredError } = await supabase
          .from('athletes')
          .select('*')
          .eq('coach_uuid', coachData[0].id);

        console.log('Manually filtered athletes:', { filteredAthletes, filteredError });
      }

      // Test RLS function
      const { data: rlsTest, error: rlsError } = await supabase
        .rpc('get_current_coach_id');

      console.log('RLS function test:', { rlsTest, rlsError });
    };

    debugRLS();
  }, [profile]);
};
