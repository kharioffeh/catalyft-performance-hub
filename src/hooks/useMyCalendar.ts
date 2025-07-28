import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsData } from './useSessionsData';

export const useMyCalendar = () => {
  const { profile } = useAuth();
  const { sessions, isLoading } = useSessionsData(profile);

  return useQuery({
    queryKey: ['my-calendar', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { sessions: [], todaySessions: [] };
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      
      // Filter sessions for today - solo user only
      const todaySessions = sessions?.filter(session => {
        const sessionDate = new Date(session.scheduled_for);
        return sessionDate >= todayStart && sessionDate < todayEnd;
      }) || [];
      
      return {
        sessions: sessions || [],
        todaySessions,
        upcomingCount: todaySessions.length,
        completedToday: todaySessions.filter(s => s.completed_at).length
      };
    },
    enabled: !!profile?.id && !isLoading,
    refetchInterval: 60000, // Refetch every minute
  });
};