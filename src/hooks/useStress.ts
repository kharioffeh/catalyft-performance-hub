import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface StressData {
  current: number;
  average7d: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  level: 'low' | 'moderate' | 'high';
  dailyReadings: Array<{
    date: string;
    value: number;
  }>;
}

// Generate mock stress data
const generateMockStressData = (): StressData => {
  // Generate daily readings for the last 7 days
  const dailyReadings = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic stress values (20-80 range with some variation)
    const baseStress = 40 + Math.sin(i * 0.5) * 15; // Creates wave pattern
    const noise = (Math.random() - 0.5) * 20; // Add some randomness
    const value = Math.max(15, Math.min(85, Math.round(baseStress + noise)));
    
    dailyReadings.push({
      date: date.toISOString().split('T')[0],
      value
    });
  }

  const current = dailyReadings[dailyReadings.length - 1].value;
  const average7d = Math.round(dailyReadings.reduce((sum, reading) => sum + reading.value, 0) / dailyReadings.length);
  
  // Calculate trend
  const recent3 = dailyReadings.slice(-3).reduce((sum, r) => sum + r.value, 0) / 3;
  const previous3 = dailyReadings.slice(-6, -3).reduce((sum, r) => sum + r.value, 0) / 3;
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (recent3 > previous3 + 5) trend = 'increasing';
  else if (recent3 < previous3 - 5) trend = 'decreasing';

  // Determine stress level
  let level: 'low' | 'moderate' | 'high';
  if (current <= 30) level = 'low';
  else if (current <= 60) level = 'moderate';
  else level = 'high';

  return {
    current,
    average7d,
    trend,
    level,
    dailyReadings
  };
};

export const useStress = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['stress', profile?.id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return generateMockStressData();
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for demo
  });
};