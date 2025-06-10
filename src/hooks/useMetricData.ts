
import { useAuth } from '@/contexts/AuthContext';
import { useReadinessData } from './analytics/useReadinessData';
import { useSleepData } from './analytics/useSleepData';
import { useLoadData } from './analytics/useLoadData';
import { MetricType, MetricDataResult } from './analytics/types';

export const useMetricData = (metric: MetricType, period: number) => {
  const { profile } = useAuth();

  const readinessQuery = useReadinessData(profile?.id, period);
  const sleepQuery = useSleepData(profile?.id, period);
  const loadQuery = useLoadData(profile?.id, period);

  switch (metric) {
    case "readiness":
      return readinessQuery;
    case "sleep":
      return sleepQuery;
    case "load":
      return loadQuery;
    default:
      return { data: null, isLoading: false, error: null };
  }
};
