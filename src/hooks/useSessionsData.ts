
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  athletes?: {
    name: string;
  };
}

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

      return data as Session[];
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
          
          // Show toast notification for the change
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Session Added",
              description: "A new training session has been scheduled",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Session Updated",
              description: "A training session has been modified",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Session Deleted",
              description: "A training session has been removed",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, queryClient]);

  return { sessions, isLoading, queryClient };
};
