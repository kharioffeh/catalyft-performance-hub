
import { useAuth } from '@/contexts/AuthContext';
import { useCoachQuery } from './useCoachQuery';
import { useAthletesQuery } from './useAthletesQuery';
import { useAthletesRealtime } from './useAthletesRealtime';

export const useAthleteQueriesRealtime = () => {
  const { profile } = useAuth();

  // Fetch coach data
  const { data: coachData, isLoading: isCoachLoading, error: coachError } = useCoachQuery();

  // Fetch athletes data
  const { data: athletes = [], isLoading: isAthletesLoading, refetch } = useAthletesQuery({
    coachId: coachData?.id
  });

  // Set up realtime subscription
  useAthletesRealtime({
    coachId: coachData?.id,
    refetch
  });

  // Combined loading state
  const isLoading = isCoachLoading || (coachData && isAthletesLoading);

  return {
    athletes,
    isLoading,
    coachData,
    coachError,
    refetch
  };
};
