
import React from 'react';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { SessionChip } from './SessionChip';
import { format, parseISO, isSameDay, addDays, startOfDay } from 'date-fns';

interface Session {
  id: string;
  user_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  user?: {
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

  return (
    <GlassContainer className="h-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Upcoming Sessions
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedSessions).map(([dateKey, dateSessions]) => {
            if (dateSessions.length === 0) return null;
            
            const date = parseISO(dateKey);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            
            return (
              <div key={dateKey} className="space-y-2">
                <div className={`text-sm font-medium ${
                  isToday ? 'text-blue-400' : 
                  isSelected ? 'text-white' : 'text-white/60'
                }`}>
                  {isToday ? 'Today' : format(date, 'EEEE, MMM d')}
                </div>
                
                {dateSessions.map((session) => (
                  <SessionChip
                    key={session.id}
                    session={session}
                    onClick={() => onSessionClick(session)}
                  />
                ))}
              </div>
            );
          })}
          
          {sessions.length === 0 && (
            <div className="text-center py-8 text-white/60">
              No upcoming sessions scheduled
            </div>
          )}
        </div>
      </div>
    </GlassContainer>
  );
};
