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
  intradayReadings: Array<{
    time: string;
    hour: number;
    value: number;
  }>;
  stressZones: {
    low: number;
    moderate: number;
    high: number;
    dominant: 'low' | 'moderate' | 'high';
  };
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
      
      // Generate intraday readings for today (24 hours)
      const intradayReadings = Array.from({ length: 24 }, (_, hour) => {
        // Simulate realistic stress patterns throughout the day
        let baseStress = 1.0;
        
        // Higher stress during work hours (9-17)
        if (hour >= 9 && hour <= 17) {
          baseStress = 1.5 + Math.random() * 1.0; // 1.5-2.5
        }
        // Moderate stress in evening (18-22)
        else if (hour >= 18 && hour <= 22) {
          baseStress = 1.0 + Math.random() * 0.8; // 1.0-1.8
        }
        // Low stress at night/early morning (23-8)
        else {
          baseStress = 0.2 + Math.random() * 0.6; // 0.2-0.8
        }
        
        // Add some natural variation
        baseStress += (Math.random() - 0.5) * 0.3;
        
        return {
          time: `${hour.toString().padStart(2, '0')}:00`,
          hour,
          value: Math.max(0.1, Math.min(3.0, baseStress)), // Clamp between 0.1-3.0
        };
      });

      // Calculate stress zones for today
      const lowZone = intradayReadings.filter(r => r.value <= 1.0).length;
      const moderateZone = intradayReadings.filter(r => r.value > 1.0 && r.value <= 2.0).length;
      const highZone = intradayReadings.filter(r => r.value > 2.0).length;
      
      const dominantZone = lowZone > moderateZone && lowZone > highZone ? 'low' :
                          moderateZone > highZone ? 'moderate' : 'high';

      console.log('Stress data generated:', { current, level: getLevel(current), average7d });
      
      return {
        current,
        level: getLevel(current),
        average7d,
        trend: getTrend(),
        dailyReadings,
        intradayReadings,
        stressZones: {
          low: lowZone,
          moderate: moderateZone, 
          high: highZone,
          dominant: dominantZone
        }
      };
    }
  });
};