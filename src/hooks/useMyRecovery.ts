import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface MyRecoveryData {
  recovery: number | null;
  trend?: {
    value: string;
    positive: boolean;
  };
  lastUpdated?: Date;
}

export const useMyRecovery = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['my-recovery', profile?.id],
    queryFn: async (): Promise<MyRecoveryData> => {
      if (!profile?.id) return { recovery: null };
      
      // Mock data - focused on solo user's recovery metrics
      const mockRecovery = Math.floor(Math.random() * 40) + 60; // 60-100 range
      
      return {
        recovery: mockRecovery,
        trend: {
          value: '+2.3',
          positive: true
        },
        lastUpdated: new Date()
      };
    },
    enabled: !!profile?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};