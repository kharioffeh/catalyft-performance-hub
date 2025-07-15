
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAthletesRealtimeProps {
  coachId?: string;
  refetch: () => void;
}

export const useAthletesRealtimeSubscription = ({ coachId, refetch }: UseAthletesRealtimeProps) => {
  useEffect(() => {
    if (!coachId) return;

    console.log('Setting up realtime subscription for coach:', coachId);

    const channel = supabase
      .channel(`coach_${coachId}_athletes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'athletes',
          filter: `coach_uuid=eq.${coachId}`
        },
        (payload) => {
          console.log('Realtime athlete change:', payload);
          refetch();
        }
      )
      .on('broadcast', { event: 'athlete_added' }, (payload) => {
        console.log('Athlete added broadcast:', payload);
        refetch();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [coachId, refetch]);
};
