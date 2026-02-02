import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SleepStage {
  time: string;
  stage: 'awake' | 'light' | 'deep' | 'rem';
  duration: number; // minutes
}

export interface SleepSession {
  id: string;
  date: string;
  bedtime: string;
  sleepTime: string;
  wakeTime: string;
  totalSleepHours: number;
  sleepEfficiency: number; // percentage
  stages: SleepStage[];
  heartRate: {
    avg: number;
    min: number;
    max: number;
  };
  score: number;
  createdAt: Date;
}

interface UseSleepReturn {
  sessions: SleepSession[];
  isLoading: boolean;
  getLastNightSleep: () => SleepSession | null;
  getSleepForDate: (date: string) => SleepSession | null;
  getSleepScore: () => number;
  getAverageSleepHours: (days?: number) => number;
  getSleepEfficiencyTrend: (days?: number) => number[];
}

// Mock sleep stage data generator
const generateSleepStages = (sleepHours: number): SleepStage[] => {
  const stages: SleepStage[] = [];
  const totalMinutes = sleepHours * 60;
  let currentTime = new Date();
  currentTime.setHours(22, 30, 0); // Start at 10:30 PM

  const cyclePatterns = [
    { stage: 'light' as const, ratio: 0.5 },
    { stage: 'deep' as const, ratio: 0.25 },
    { stage: 'rem' as const, ratio: 0.2 },
    { stage: 'awake' as const, ratio: 0.05 }
  ];

  let remainingMinutes = totalMinutes;

  while (remainingMinutes > 0) {
    for (const pattern of cyclePatterns) {
      if (remainingMinutes <= 0) break;

      const duration = Math.min(
        Math.round((totalMinutes * pattern.ratio * (0.8 + Math.random() * 0.4)) / cyclePatterns.length),
        remainingMinutes
      );

      if (duration > 0) {
        stages.push({
          time: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          stage: pattern.stage,
          duration
        });

        currentTime.setMinutes(currentTime.getMinutes() + duration);
        remainingMinutes -= duration;
      }
    }
  }

  return stages;
};

// Generate mock sleep data as fallback
const generateMockSleepData = (): SleepSession[] => {
  const sessions: SleepSession[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const sleepHours = 6.5 + Math.random() * 2.5;
    const efficiency = 75 + Math.random() * 20;
    const stages = generateSleepStages(sleepHours);

    const deepSleepRatio = stages.filter(s => s.stage === 'deep').reduce((sum, s) => sum + s.duration, 0) / (sleepHours * 60);
    const score = Math.round(
      (sleepHours / 8) * 30 +
      (efficiency / 100) * 40 +
      deepSleepRatio * 30
    );

    sessions.push({
      id: `sleep-${i}`,
      date: date.toISOString().split('T')[0],
      bedtime: '22:30',
      sleepTime: '23:00',
      wakeTime: '07:00',
      totalSleepHours: Math.round(sleepHours * 10) / 10,
      sleepEfficiency: Math.round(efficiency),
      stages,
      heartRate: {
        avg: 55 + Math.round(Math.random() * 15),
        min: 45 + Math.round(Math.random() * 10),
        max: 70 + Math.round(Math.random() * 20)
      },
      score: Math.max(0, Math.min(100, score)),
      createdAt: date
    });
  }

  return sessions.reverse();
};

export const useSleep = (): UseSleepReturn => {
  const { profile } = useAuth();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sleep-sessions', profile?.id],
    queryFn: async (): Promise<SleepSession[]> => {
      if (!profile?.id) return generateMockSleepData();

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const { data, error } = await supabase
        .from('vw_sleep_daily')
        .select('*')
        .eq('athlete_uuid', profile.id)
        .gte('day', thirtyDaysAgo)
        .order('day', { ascending: true });

      if (error || !data || data.length === 0) {
        return generateMockSleepData();
      }

      return data.map((row: any, i: number) => {
        const totalSleepHours = row.total_sleep_hours ?? 7;
        const sleepEfficiency = row.sleep_efficiency ?? 85;
        const avgHr = row.avg_sleep_hr ?? 58;
        const hrv = row.hrv_rmssd ?? 0;

        // Calculate score from duration + efficiency
        const durationScore = Math.min(1, totalSleepHours / 8) * 40;
        const efficiencyScore = (sleepEfficiency / 100) * 40;
        const hrvBonus = hrv > 0 ? Math.min(20, (hrv / 100) * 20) : 10;
        const score = Math.round(Math.max(0, Math.min(100, durationScore + efficiencyScore + hrvBonus)));

        return {
          id: `db-sleep-${i}`,
          date: row.day,
          bedtime: '22:30',
          sleepTime: '23:00',
          wakeTime: '07:00',
          totalSleepHours: Math.round(totalSleepHours * 10) / 10,
          sleepEfficiency: Math.round(sleepEfficiency),
          stages: [], // Not available from real data
          heartRate: {
            avg: Math.round(avgHr),
            min: Math.round(avgHr * 0.8),
            max: Math.round(avgHr * 1.3),
          },
          score,
          createdAt: new Date(row.day),
        };
      });
    },
    enabled: true,
  });

  const getLastNightSleep = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return sessions.find(session =>
      session.date === today || session.date === yesterdayStr
    ) || null;
  }, [sessions]);

  const getSleepForDate = useCallback((date: string) => {
    return sessions.find(session => session.date === date) || null;
  }, [sessions]);

  const getSleepScore = useCallback(() => {
    const lastNight = getLastNightSleep();
    return lastNight?.score || 0;
  }, [getLastNightSleep]);

  const getAverageSleepHours = useCallback((days: number = 7) => {
    const recentSessions = sessions.slice(-days);
    if (recentSessions.length === 0) return 0;
    const totalHours = recentSessions.reduce((sum, session) => sum + session.totalSleepHours, 0);
    return Math.round((totalHours / recentSessions.length) * 10) / 10;
  }, [sessions]);

  const getSleepEfficiencyTrend = useCallback((days: number = 7) => {
    return sessions.slice(-days).map(session => session.sleepEfficiency);
  }, [sessions]);

  return {
    sessions,
    isLoading,
    getLastNightSleep,
    getSleepForDate,
    getSleepScore,
    getAverageSleepHours,
    getSleepEfficiencyTrend,
  };
};
