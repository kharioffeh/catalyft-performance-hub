
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Athlete } from '@/types/athlete';

export const useAthleteQueriesRealtime = () => {
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
      if (!error || error.message === 'No profile email found') {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Fetch athletes using the new view - only run if we have coach data
  const { data: athletes = [], isLoading: isAthletesLoading, refetch } = useQuery({
    queryKey: ['athletes', coachData?.id],
    queryFn: async () => {
      if (!coachData?.id) {
        console.log('No coach ID available for athletes query');
        return [];
      }
      
      console.log('Fetching athletes for coach:', coachData.id);
      
      const { data, error } = await supabase
        .from('vw_coach_athletes')
        .select('*')
        .eq('coach_uuid', coachData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Athletes fetch error:', error);
        throw error;
      }
      
      console.log('Athletes fetched:', data?.length || 0);
      return data as Athlete[];
    },
    enabled: !!coachData?.id && profile?.role === 'coach'
  });

  // Set up realtime subscription for athlete changes
  useEffect(() => {
    if (!coachData?.id) return;

    console.log('Setting up realtime subscription for coach:', coachData.id);

    const channel = supabase
      .channel(`coach_${coachData.id}_athletes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'athletes',
          filter: `coach_uuid=eq.${coachData.id}`
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
  }, [coachData?.id, refetch]);

  // Combined loading state
  const isLoading = isCoachLoading || (coachData && isAthletesLoading);

  return {
    athletes,
    isLoading,
    coachData,
    coachError,
    refetch
  };
};
