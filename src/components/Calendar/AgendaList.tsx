
import React from 'react';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { SessionChip } from './SessionChip';
import { format, parseISO, isSameDay, addDays, startOfDay } from 'date-fns';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  athletes?: {
    name: string;
  };
}

interface AgendaListProps {
  sessions: Session[];
  selectedDate: Date;
  onSessionClick: (session: Session) => void;
}

export const AgendaList: React.FC<AgendaListProps> = ({
  sessions,
  selectedDate,
  onSessionClick
}) => {
  // Group sessions by date, starting from selected date and showing next 30 days
  const groupedSessions = React.useMemo(() => {
    const groups: { [key: string]: Session[] } = {};
    
    // Generate next 30 days starting from selected date
    for (let i = 0; i < 30; i++) {
      const date = addDays(startOfDay(selectedDate), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      groups[dateKey] = [];
    }
    
    // Group sessions by date
    sessions.forEach(session => {
      const sessionDate = format(parseISO(session.start_ts), 'yyyy-MM-dd');
      if (groups[sessionDate]) {
        groups[sessionDate].push(session);
      }
    });
    
    return groups;
  }, [sessions, selectedDate]);

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    
    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, addDays(today, 1))) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedSessions).map(([dateString, dateSessions]) => (
        <GlassContainer key={dateString}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {formatDateHeader(dateString)}
            </h3>
            
            {dateSessions.length > 0 ? (
              <div className="space-y-3">
                {dateSessions
                  .sort((a, b) => new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime())
                  .map(session => (
                    <SessionChip
                      key={session.id}
                      session={session}
                      onClick={() => onSessionClick(session)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No sessions scheduled</p>
              </div>
            )}
          </div>
        </GlassContainer>
      ))}
    </div>
  );
};
