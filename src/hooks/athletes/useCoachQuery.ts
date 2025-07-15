
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useCoachQuery = () => {
  const { profile } = useAuth();

  return useQuery({
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
      if (!error || error.message === 'No profile email found') {
        return false;
      }
      return failureCount < 2;
    }
  });
};
