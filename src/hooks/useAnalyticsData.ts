import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  tonnage: Array<{
    date: string;
    tonnage: number;
  }>;
  e1rmCurve: Array<{
    exercise: string;
    date: string;
    e1rm: number;
  }>;
  velocityFatigue: Array<{
    date: string;
    avg_velocity: number;
    max_load: number;
  }>;
  muscleLoad: Array<{
    user_id: string;
    date: string;
    muscle: string;
    load_score: number;
  }>;
}

const fetcher = async (url: string, token: string): Promise<AnalyticsData> => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }

  return response.json();
};

export const useAnalyticsData = () => {
  const { session } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR(
    session?.access_token ? ['/functions/getAnalytics', session.access_token] : null,
    ([url, token]) => fetcher(url, token),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
    }
  );

  // Provide mock data as fallback
  const mockData: AnalyticsData = {
    tonnage: [
      { date: '2024-01-15', tonnage: 1140 },
      { date: '2024-01-16', tonnage: 950 },
      { date: '2024-01-17', tonnage: 1230 },
      { date: '2024-01-18', tonnage: 890 },
      { date: '2024-01-19', tonnage: 1050 },
    ],
    e1rmCurve: [
      { exercise: 'Squat', date: '2024-01-15', e1rm: 150.5 },
      { exercise: 'Bench Press', date: '2024-01-15', e1rm: 120.0 },
      { exercise: 'Deadlift', date: '2024-01-15', e1rm: 180.0 },
      { exercise: 'Squat', date: '2024-01-16', e1rm: 155.0 },
      { exercise: 'Bench Press', date: '2024-01-16', e1rm: 122.5 },
      { exercise: 'Deadlift', date: '2024-01-16', e1rm: 185.0 },
    ],
    velocityFatigue: [
      { date: '2024-01-15', avg_velocity: 0.85, max_load: 100 },
      { date: '2024-01-16', avg_velocity: 0.75, max_load: 110 },
      { date: '2024-01-17', avg_velocity: 0.9, max_load: 95 },
      { date: '2024-01-18', avg_velocity: 0.65, max_load: 115 },
      { date: '2024-01-19', avg_velocity: 0.8, max_load: 105 },
    ],
    muscleLoad: [
      { user_id: 'user1', date: '2024-01-15', muscle: 'quadriceps', load_score: 75.5 },
      { user_id: 'user1', date: '2024-01-15', muscle: 'chest', load_score: 65.0 },
      { user_id: 'user1', date: '2024-01-16', muscle: 'quadriceps', load_score: 80.0 },
      { user_id: 'user1', date: '2024-01-16', muscle: 'hamstrings', load_score: 70.0 },
      { user_id: 'user1', date: '2024-01-17', muscle: 'chest', load_score: 85.0 },
    ],
  };

  return {
    data: data || mockData,
    error,
    isLoading,
    refresh: mutate,
  };
};