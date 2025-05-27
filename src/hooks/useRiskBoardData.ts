
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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['riskBoard', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('vw_risk_board')
        .select('*')
        .eq('coach_uuid', profile.id)
        .order('flag', { ascending: false })
        .order('readiness', { ascending: true });

      if (error) throw error;
      return data as RiskBoardData[];
    },
    enabled: !!profile?.id && profile?.role === 'coach'
  });

  // Set up realtime listener
  React.useEffect(() => {
    if (!profile?.id) return;

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
      supabase.removeChannel(channel);
    };
  }, [profile?.id, refetch]);

  return {
    riskBoardData: data || [],
    isLoading,
    refetch
  };
};
