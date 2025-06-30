
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalyticsRefresh = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const refreshAnalytics = useCallback(async () => {
    if (!profile?.id) return;

    // Invalidate all analytics-related queries
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['readiness'] }),
      queryClient.invalidateQueries({ queryKey: ['sleep'] }),
      queryClient.invalidateQueries({ queryKey: ['load'] }),
      queryClient.invalidateQueries({ queryKey: ['strain'] }),
    ]);

    // Refetch fresh data
    await queryClient.refetchQueries({ 
      queryKey: ['readiness', 'sleep', 'load', 'strain'],
      type: 'active'
    });
  }, [queryClient, profile?.id]);

  return refreshAnalytics;
};
