import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

const getLevel = (stress: number): 'low' | 'moderate' | 'high' => {
  if (stress <= 33) return 'low';
  if (stress <= 66) return 'moderate';
  return 'high';
};

// Generate mock intraday readings (not available from real data)
const generateMockIntraday = () =>
  Array.from({ length: 24 }, (_, hour) => {
    let baseStress = 1.0;
    if (hour >= 9 && hour <= 17) baseStress = 1.5 + Math.random() * 1.0;
    else if (hour >= 18 && hour <= 22) baseStress = 1.0 + Math.random() * 0.8;
    else baseStress = 0.2 + Math.random() * 0.6;
    baseStress += (Math.random() - 0.5) * 0.3;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour,
      value: Math.max(0.1, Math.min(3.0, baseStress)),
    };
  });

// Full mock fallback
const generateMockStressData = (): StressData => {
  const dailyReadings: StressReading[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const baseStress = 35 + Math.random() * 30;
    const dailyVariation = (Math.random() - 0.5) * 20;
    const value = Math.max(0, Math.min(100, Math.round(baseStress + dailyVariation)));
    dailyReadings.push({ date: formattedDate, value });
  }

  const current = dailyReadings[dailyReadings.length - 1].value;
  const average7d = Math.round(dailyReadings.reduce((sum, r) => sum + r.value, 0) / dailyReadings.length);

  const recent = dailyReadings.slice(-3).map(r => r.value);
  const older = dailyReadings.slice(0, 4).map(r => r.value);
  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;
  const trend: StressData['trend'] = recentAvg > olderAvg + 5 ? 'increasing' : recentAvg < olderAvg - 5 ? 'decreasing' : 'stable';

  const intradayReadings = generateMockIntraday();
  const lowZone = intradayReadings.filter(r => r.value <= 1.0).length;
  const moderateZone = intradayReadings.filter(r => r.value > 1.0 && r.value <= 2.0).length;
  const highZone = intradayReadings.filter(r => r.value > 2.0).length;
  const dominant = lowZone > moderateZone && lowZone > highZone ? 'low' as const : moderateZone > highZone ? 'moderate' as const : 'high' as const;

  return {
    current,
    level: getLevel(current),
    average7d,
    trend,
    dailyReadings,
    intradayReadings,
    stressZones: { low: lowZone, moderate: moderateZone, high: highZone, dominant },
  };
};

export const useStress = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['stress-data', profile?.id],
    queryFn: async (): Promise<StressData> => {
      if (!profile?.id) return generateMockStressData();

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Query whoop_cycles for strain data (0-21 scale)
      const { data: cycles, error: cyclesError } = await supabase
        .from('whoop_cycles')
        .select('strain, day')
        .eq('user_id', profile.id)
        .gte('day', sevenDaysAgo.split('T')[0])
        .order('day', { ascending: true });

      if (cyclesError || !cycles || cycles.length === 0) {
        return generateMockStressData();
      }

      // Normalize strain (0-21) to 0-100
      const dailyReadings: StressReading[] = cycles.map((c: any) => {
        const strain = c.strain ?? 0;
        const normalized = Math.round((strain / 21) * 100);
        const date = new Date(c.day);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.max(0, Math.min(100, normalized)),
        };
      });

      const current = dailyReadings[dailyReadings.length - 1].value;
      const average7d = Math.round(dailyReadings.reduce((sum, r) => sum + r.value, 0) / dailyReadings.length);

      // Calculate trend: last 3 days avg vs prior days avg
      const recentDays = dailyReadings.slice(-3);
      const olderDays = dailyReadings.slice(0, Math.max(1, dailyReadings.length - 3));
      const recentAvg = recentDays.reduce((s, r) => s + r.value, 0) / recentDays.length;
      const olderAvg = olderDays.reduce((s, r) => s + r.value, 0) / olderDays.length;
      const trend: StressData['trend'] = recentAvg > olderAvg + 5 ? 'increasing' : recentAvg < olderAvg - 5 ? 'decreasing' : 'stable';

      // Intraday readings not available from real data — use mock
      const intradayReadings = generateMockIntraday();
      const lowZone = intradayReadings.filter(r => r.value <= 1.0).length;
      const moderateZone = intradayReadings.filter(r => r.value > 1.0 && r.value <= 2.0).length;
      const highZone = intradayReadings.filter(r => r.value > 2.0).length;
      const dominant = lowZone > moderateZone && lowZone > highZone ? 'low' as const : moderateZone > highZone ? 'moderate' as const : 'high' as const;

      return {
        current,
        level: getLevel(current),
        average7d,
        trend,
        dailyReadings,
        intradayReadings,
        stressZones: { low: lowZone, moderate: moderateZone, high: highZone, dominant },
      };
    },
  });
};
