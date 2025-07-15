import { useSessionsData } from './useSessionsData';
import { useAuth } from '@/contexts/AuthContext';
import { Session } from '@/types/training';

export const useCalendar = () => {
  const { profile } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);

  return {
    sessions,
    isLoading,
    queryClient
  };
};

