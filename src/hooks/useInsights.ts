import { useState, useEffect } from 'react';
import { useMetrics } from './useMetrics';
import { useStress } from './useStress';
import { useSleep } from './useSleep';
import { useEnhancedMetricsWithAthlete } from './useEnhancedMetricsWithAthlete';
import { useAuth } from '@/contexts/AuthContext';
import { generateInsights, Insight } from '@catalyft/core';

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const { profile } = useAuth();
  const { data: metricsData } = useMetrics();
  const { data: stressData } = useStress();
  const { getSleepScore, getLastNightSleep } = useSleep();
  const { loadACWR } = useEnhancedMetricsWithAthlete(profile?.id);

  useEffect(() => {
    // Use core generateInsights function
    const sleepScore = getSleepScore();
    const newInsights = generateInsights({
      metricsData,
      stressData,
      sleepScore,
      loadACWR
    });

    setInsights(newInsights.slice(0, 5)); // Limit to 5 insights
  }, [metricsData, stressData, getSleepScore, getLastNightSleep, loadACWR]);

  return insights;
};

