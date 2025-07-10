import { useQuery } from '@tanstack/react-query';

export interface StressReading {
  date: string;
  value: number;
}

export interface StressData {
  current: number;
  level: 'low' | 'moderate' | 'high';
  average7d: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  dailyReadings: StressReading[];
}

export const useStress = () => {
  return useQuery({
    queryKey: ['stress-data'],
    queryFn: async (): Promise<StressData> => {
      // Generate mock stress data
      const dailyReadings: StressReading[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Generate realistic stress values (0-100)
        const baseStress = 35 + Math.random() * 30; // 35-65 base range
        const dailyVariation = (Math.random() - 0.5) * 20; // ±10 variation
        const value = Math.max(0, Math.min(100, Math.round(baseStress + dailyVariation)));
        
        dailyReadings.push({
          date: formattedDate,
          value
        });
      }
      
      const current = dailyReadings[dailyReadings.length - 1].value;
      const average7d = Math.round(dailyReadings.reduce((sum, reading) => sum + reading.value, 0) / dailyReadings.length);
      
      const getLevel = (stress: number): 'low' | 'moderate' | 'high' => {
        if (stress <= 30) return 'low';
        if (stress <= 60) return 'moderate';
        return 'high';
      };
      
      const getTrend = (): 'increasing' | 'decreasing' | 'stable' => {
        const recent = dailyReadings.slice(-3).map(r => r.value);
        const older = dailyReadings.slice(0, 3).map(r => r.value);
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        if (recentAvg > olderAvg + 5) return 'increasing';
        if (recentAvg < olderAvg - 5) return 'decreasing';
        return 'stable';
      };
      
      console.log('Stress data generated:', { current, level: getLevel(current), average7d });
      
      return {
        current,
        level: getLevel(current),
        average7d,
        trend: getTrend(),
        dailyReadings
      };
    }
  });
};