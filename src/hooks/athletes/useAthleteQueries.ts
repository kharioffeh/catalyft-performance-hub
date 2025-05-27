
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Athlete } from '@/types/athlete';

export const useAthleteQueries = () => {
  const { profile } = useAuth();

  // Fetch coach ID for the current user
  const { data: coachData, isLoading: isCoachLoading, error: coachError } = useQuery({
    queryKey: ['coach', profile?.id],
    queryFn: async () => {
      if (!profile?.email) {
        console.log('No profile email found for coach lookup');
        throw new Error('No profile email found');
      }
      
      console.log('Looking up coach for email:', profile.email);
      
      const { data, error } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', profile.email)
        .maybeSingle();

      if (error) {
        console.error('Coach lookup error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No coach record found for email:', profile.email);
        return null;
      }
      
      console.log('Coach found:', data);
      return data;
    },
    enabled: !!profile?.email && profile.role === 'coach',
    retry: (failureCount, error) => {
      // Don't retry if it's a "not found" case
      if (!error || error.message === 'No profile email found') {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Fetch athletes - only run if we have coach data
  const { data: athletes = [], isLoading: isAthletesLoading } = useQuery({
    queryKey: ['athletes', coachData?.id],
    queryFn: async () => {
      if (!coachData?.id) {
        console.log('No coach ID available for athletes query');
        return [];
      }
      
      console.log('Fetching athletes for coach:', coachData.id);
      
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('coach_uuid', coachData.id)
        .order('name');

      if (error) {
        console.error('Athletes fetch error:', error);
        throw error;
      }
      
      console.log('Athletes fetched:', data?.length || 0);
      return data as Athlete[];
    },
    enabled: !!coachData?.id && profile?.role === 'coach'
  });

  // Combined loading state
  const isLoading = isCoachLoading || (coachData && isAthletesLoading);

  return {
    athletes,
    isLoading,
    coachData,
    coachError
  };
};
