import { useState, useEffect } from 'react';
import { useMetrics } from './useMetrics';
import { useStress } from './useStress';
import { useSleep } from './useSleep';
import { useEnhancedMetricsWithAthlete } from './useEnhancedMetricsWithAthlete';
import { useAuth } from '@/contexts/AuthContext';

export interface Insight {
  id: string;
  title: string;
  message: string;
  type: 'readiness' | 'sleep' | 'load' | 'stress' | 'general';
  severity: 'green' | 'amber' | 'red';
  route?: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const { profile } = useAuth();
  const { data: metricsData } = useMetrics();
  const { data: stressData } = useStress();
  const { getSleepScore, getLastNightSleep } = useSleep();
  const { loadACWR } = useEnhancedMetricsWithAthlete(profile?.id);

  useEffect(() => {
    const newInsights: Insight[] = [];

    // Readiness insights
    if (metricsData?.recovery !== null && metricsData?.recovery !== undefined) {
      const readiness = metricsData.recovery;
      let severity: 'green' | 'amber' | 'red' = 'green';
      let message = '';
      
      if (readiness < 60) {
        severity = 'red';
        message = 'Low readiness detected. Prioritize rest and recovery today.';
      } else if (readiness < 80) {
        severity = 'amber';
        message = 'Moderate readiness. Consider light to moderate training.';
      } else {
        message = 'High readiness. Green light for intense training today.';
      }

      newInsights.push({
        id: 'readiness-insight',
        title: 'Readiness',
        message,
        type: 'readiness',
        severity,
        route: '/analytics/readiness',
        value: readiness,
        trend: 'stable' // Would be calculated from historical data
      });
    }

    // Sleep insights
    const sleepScore = getSleepScore();
    const lastNight = getLastNightSleep();
    if (sleepScore) {
      let severity: 'green' | 'amber' | 'red' = 'green';
      let message = '';
      
      if (sleepScore < 70) {
        severity = 'red';
        message = `Poor sleep quality (${sleepScore}%). Focus on sleep hygiene tonight.`;
      } else if (sleepScore < 85) {
        severity = 'amber';
        message = `Moderate sleep quality (${sleepScore}%). Room for improvement.`;
      } else {
        message = `Excellent sleep quality (${sleepScore}%). Well rested for training.`;
      }

      newInsights.push({
        id: 'sleep-insight',
        title: 'Sleep Quality',
        message,
        type: 'sleep',
        severity,
        route: '/sleep',
        value: sleepScore,
        trend: lastNight?.sleepEfficiency && lastNight.sleepEfficiency > sleepScore ? 'down' : 'up'
      });
    }

    // Training load insights
    const latestACWR = loadACWR[loadACWR.length - 1];
    if (latestACWR?.acwr_7_28 !== null && latestACWR?.acwr_7_28 !== undefined) {
      const acwr = latestACWR.acwr_7_28;
      let severity: 'green' | 'amber' | 'red' = 'green';
      let message = '';
      
      if (acwr > 1.5) {
        severity = 'red';
        message = `High training load (${acwr.toFixed(2)}). Elevated injury risk detected.`;
      } else if (acwr > 1.3) {
        severity = 'amber';
        message = `Moderate training load (${acwr.toFixed(2)}). Monitor fatigue closely.`;
      } else if (acwr < 0.8) {
        severity = 'amber';
        message = `Low training load (${acwr.toFixed(2)}). Safe to increase intensity.`;
      } else {
        message = `Optimal training load (${acwr.toFixed(2)}). Maintain current approach.`;
      }

      newInsights.push({
        id: 'load-insight',
        title: 'Training Load',
        message,
        type: 'load',
        severity,
        route: '/analytics/load',
        value: acwr,
        trend: 'stable'
      });
    }

    // Stress insights
    if (stressData?.current !== null && stressData?.current !== undefined) {
      const stress = stressData.current;
      let severity: 'green' | 'amber' | 'red' = 'green';
      let message = '';
      
      if (stress > 70) {
        severity = stress > 85 ? 'red' : 'amber';
        message = `Elevated stress levels (${stress}). Consider relaxation techniques.`;
      } else if (stress < 30) {
        message = `Low stress levels (${stress}). Optimal state for training.`;
      } else {
        message = `Moderate stress levels (${stress}). Well balanced state.`;
      }

      newInsights.push({
        id: 'stress-insight',
        title: 'Stress Level',
        message,
        type: 'stress',
        severity,
        route: '/analytics/stress',
        value: stress,
        trend: 'stable'
      });
    }

    // General performance insight
    if (metricsData && sleepScore) {
      const combinedScore = (metricsData.recovery + sleepScore) / 2;
      if (combinedScore > 85) {
        newInsights.push({
          id: 'performance-insight',
          title: 'Performance State',
          message: 'Peak performance window detected. Perfect time for challenging workouts.',
          type: 'general',
          severity: 'green',
          route: '/analytics',
          value: combinedScore,
          trend: 'up'
        });
      }
    }

    setInsights(newInsights.slice(0, 5)); // Limit to 5 insights
  }, [metricsData, stressData, getSleepScore, getLastNightSleep, loadACWR]);

  return insights;
};