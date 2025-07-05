
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface MetricsData {
  recovery: number | null;
  strain: number | null;
  recoveryTrend?: {
    value: string;
    positive: boolean;
  };
  strainTrend?: {
    value: string;
    positive: boolean;
  };
}

export const useMetrics = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['metrics', profile?.id],
    queryFn: async (): Promise<MetricsData> => {
      // Mock data - in a real app this would fetch from Supabase
      // Recovery maps to readiness (0-100 scale)
      // Strain uses 0-21 scale
      
      const mockRecovery = Math.floor(Math.random() * 40) + 60; // 60-100 range
      const mockStrain = Math.floor(Math.random() * 15) + 6; // 6-21 range
      
      return {
        recovery: mockRecovery,
        strain: mockStrain,
        recoveryTrend: {
          value: '+2.3',
          positive: true
        },
        strainTrend: {
          value: '-1.1',
          positive: true // Lower strain is better
        }
      };
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for demo
  });
};
