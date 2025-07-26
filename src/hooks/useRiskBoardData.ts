
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RiskBoardData {
  athlete_id: string;
  name: string;
  coach_uuid: string;
  readiness: number;
  acwr: number;
  yesterday_hsr: number;
  flag: 'red' | 'amber' | 'green';
}

export const useRiskBoardData = () => {
  const { profile } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['riskBoard', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        console.log('No profile ID available for risk board');
        return [];
      }

      console.log('Fetching risk board data for coach:', profile.id);

      const { data, error } = await supabase
        .from('vw_risk_board')
        .select('*')
        .eq('coach_uuid', profile.id)
        .order('flag', { ascending: false })
        .order('readiness', { ascending: true });

      if (error) {
        console.error('Risk board fetch error:', error);
        throw error;
      }

      console.log('Risk board data fetched:', data?.length || 0, 'athletes');
      return data as RiskBoardData[];
    },
    enabled: false, // Risk board disabled for solo users
    retry: 2,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Set up realtime listener
  React.useEffect(() => {
    if (!profile?.id) return;

    console.log('Setting up realtime listener for risk board');

    const channel = supabase.channel(`risk_board_${profile.id}`);
    
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'readiness_scores' },
      () => {
        console.log('Risk board data updated - refetching');
        refetch();
      }
    );

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wearable_raw' },
      () => {
        console.log('Wearable data updated - refetching');
        refetch();
      }
    );

    channel.subscribe();

    return () => {
      console.log('Cleaning up risk board realtime listener');
      supabase.removeChannel(channel);
    };
  }, [profile?.id, refetch]);

  return {
    riskBoardData: data || [],
    isLoading,
    error,
    refetch
  };
};
