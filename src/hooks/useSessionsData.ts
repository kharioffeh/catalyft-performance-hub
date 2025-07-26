
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGlassToast } from '@/hooks/useGlassToast';
import { Session } from '@/types/training';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'coach' | 'athlete' | 'solo';
  created_at: string;
  updated_at: string;
}

export const useSessionsData = (profile: Profile | null) => {
  const queryClient = useQueryClient();
  const toast = useGlassToast();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          athletes (
            name
          )
        `)
        .order('start_ts', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Map database result to Session interface
      return data.map(session => ({
        ...session,
        user_uuid: session.athlete_uuid,
        program_id: session.id,
        planned_at: session.start_ts,
        title: `${session.type} Session`,
        exercises: Array.isArray(session.payload) ? [] : (session.payload as any)?.exercises || []
      })) as any[];
    },
  });

  // Set up realtime listener for sessions changes
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel(`coach_${profile.id}_calendar`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          console.log('Session change detected:', payload);
          
          // Invalidate and refetch sessions data
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
          
          // Show glass toast notification for the change
          if (payload.eventType === 'INSERT') {
            toast.success("New Session Added", "A new training session has been scheduled");
          } else if (payload.eventType === 'UPDATE') {
            toast.info("Session Updated", "A training session has been modified");
          } else if (payload.eventType === 'DELETE') {
            toast.info("Session Deleted", "A training session has been removed");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, queryClient, toast]);

  return { sessions, isLoading, queryClient };
};
