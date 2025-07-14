import { useSessionsData } from './useSessionsData';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  status: 'planned' | 'active' | 'completed';
  notes?: string;
  athletes?: {
    name: string;
  };
}

export const useCalendar = () => {
  const { profile } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);

  return {
    sessions,
    isLoading,
    queryClient
  };
};

export type { Session };