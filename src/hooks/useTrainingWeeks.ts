
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Week, Day, TrainingSession } from '@/types/training';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';

export const useTrainingWeeks = (athleteId?: string) => {
  const { data: sessions = [] } = useQuery({
    queryKey: ['training-sessions', athleteId],
    queryFn: async () => {
      if (!athleteId) return [];
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('athlete_uuid', athleteId)
        .gte('start_ts', format(new Date(), 'yyyy-MM-dd'))
        .order('start_ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!athleteId,
  });

  // Transform sessions into weeks structure
  const weeks: Week[] = [];
  const today = new Date();
  
  // Generate next 4 weeks
  for (let i = 0; i < 4; i++) {
    const weekStart = startOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    const days: Day[] = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySessions = sessions
        .filter(session => format(new Date(session.start_ts), 'yyyy-MM-dd') === dayStr)
        .map(session => ({
          id: session.id,
          title: session.type,
          type: session.type as TrainingSession['type'],
          start_time: session.start_ts,
          end_time: session.end_ts,
          athlete_id: session.athlete_uuid,
          notes: session.notes,
        }));

      return {
        date: dayStr,
        weekday: format(day, 'EEE'),
        dateLabel: format(day, 'd'),
        fullDate: format(day, 'EEEE, MMMM d'),
        sessions: daySessions,
      };
    });

    weeks.push({
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd'),
      days,
    });
  }

  return weeks;
};
