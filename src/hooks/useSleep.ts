import { useState, useCallback, useMemo } from 'react';
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
  
  // Typical sleep cycle patterns
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

// Generate mock sleep data
const generateMockSleepData = (): SleepSession[] => {
  const sessions: SleepSession[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const sleepHours = 6.5 + Math.random() * 2.5; // 6.5-9 hours
    const efficiency = 75 + Math.random() * 20; // 75-95%
    const stages = generateSleepStages(sleepHours);
    
    // Calculate score based on duration, efficiency, and deep sleep
    const deepSleepRatio = stages.filter(s => s.stage === 'deep').reduce((sum, s) => sum + s.duration, 0) / (sleepHours * 60);
    const score = Math.round(
      (sleepHours / 8) * 30 + // Duration score (30 pts)
      (efficiency / 100) * 40 + // Efficiency score (40 pts)
      deepSleepRatio * 30 // Deep sleep score (30 pts)
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
  
  return sessions.reverse(); // Most recent first
};

export const useSleep = (): UseSleepReturn => {
  const { profile } = useAuth();
  const [sessions] = useState<SleepSession[]>(generateMockSleepData());
  const [isLoading] = useState(false);

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
    const recentSessions = sessions.slice(0, days);
    const totalHours = recentSessions.reduce((sum, session) => sum + session.totalSleepHours, 0);
    return Math.round((totalHours / recentSessions.length) * 10) / 10;
  }, [sessions]);

  const getSleepEfficiencyTrend = useCallback((days: number = 7) => {
    return sessions.slice(0, days).map(session => session.sleepEfficiency);
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