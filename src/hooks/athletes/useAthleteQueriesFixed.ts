
import { useAuth } from '@/contexts/AuthContext';
import { useCoachQuery } from './useCoachQuery';
import { useAthletesQueryFixed } from './useAthletesQueryFixed';
import { useAthletesDebug } from './useAthletesDebug';

export const useAthleteQueriesFixed = () => {
  const { profile } = useAuth();

  // Add debug logging
  useAthletesDebug();

  // Fetch coach data
  const { data: coachData, isLoading: isCoachLoading, error: coachError } = useCoachQuery();

  // Fetch athletes data with fixed query
  const { data: athletes = [], isLoading: isAthletesLoading, refetch } = useAthletesQueryFixed({
    coachId: coachData?.id
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
