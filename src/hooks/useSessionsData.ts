
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGlassToast } from '@/hooks/useGlassToast';
import { Session, SessionExercise } from '@/types/training';

// Type-safe helper to extract exercises from session payload
interface PayloadWithExercises {
  exercises?: SessionExercise[];
}

const getExercisesFromPayload = (payload: unknown): SessionExercise[] => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }
  const p = payload as PayloadWithExercises;
  return Array.isArray(p.exercises) ? p.exercises : [];
};

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'coach' | 'athlete' | 'solo';
  created_at: string;
  updated_at: string;
}

// Helper function to generate "My Workout" style titles
const getSessionTitle = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'strength':
      return 'My Strength Workout';
    case 'conditioning':
      return 'My Conditioning Workout';
    case 'recovery':
      return 'My Recovery Session';
    case 'technical':
      return 'My Technical Session';
    case 'assessment':
      return 'My Assessment';
    default:
      return 'My Workout';
  }
};

export const useSessionsData = (profile: Profile | null) => {
  const queryClient = useQueryClient();
  const toast = useGlassToast();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', profile?.id],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          athletes (
            name
          )
        `)
        .order('start_ts', { ascending: true });

      // Filter by current user for solo functionality
      if (profile?.id) {
        query = query.eq('athlete_uuid', profile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Map database result to Session interface
      return data.map((session, index) => ({
        ...session,
        user_uuid: session.athlete_uuid,
        program_id: session.id,
        planned_at: session.start_ts,
        title: getSessionTitle(session.type),
        exercises: getExercisesFromPayload(session.payload),
        // Add demo color-coding data
        loadPercent: Math.floor(Math.random() * 100), // Random load 0-100%
        isPR: index % 5 === 0 // Every 5th session is a PR for demo
      })) as Session[];
    },
    enabled: !!profile?.id, // Only run query if we have a user profile
  });

  // Set up realtime listener for sessions changes
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel(`user_${profile.id}_sessions`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `athlete_uuid=eq.${profile.id}` // Only listen to current user's sessions
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
