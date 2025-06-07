
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mockAthletes } from '@/services/mockAnalyticsData';

export const useAthletes = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['athletes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      try {
        // Try to fetch real athletes first
        const { data, error } = await supabase
          .from('vw_coach_athletes')
          .select('*')
          .eq('coach_uuid', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // If we have real athletes, return them
        if (data && data.length > 0) {
          return data;
        }

        // If no real athletes, return mock athletes for testing
        return mockAthletes.map(athlete => ({
          id: athlete.id,
          name: athlete.name,
          coach_uuid: profile.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sex: 'M',
          dob: '1995-01-01',
          readiness: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 10)
        }));
      } catch (error) {
        console.error('Error fetching athletes:', error);
        
        // Fallback to mock data
        return mockAthletes.map(athlete => ({
          id: athlete.id,
          name: athlete.name,
          coach_uuid: profile.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sex: 'M',
          dob: '1995-01-01',
          readiness: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 10)
        }));
      }
    },
    enabled: !!profile?.id
  });
};
