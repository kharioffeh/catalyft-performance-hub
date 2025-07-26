
import { useQuery } from '@tanstack/react-query';

export const useAthleteType = (profileId?: string, userRole?: string) => {
  return useQuery({
    queryKey: ['athlete-type', profileId],
    queryFn: async () => {
      // All users are solo now - no coach/athlete distinction
      return { type: 'solo', hasCoach: false };
    },
    enabled: !!profileId
  });
};
