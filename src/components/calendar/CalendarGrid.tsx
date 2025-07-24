import React from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format,
  isSameMonth 
} from 'date-fns';
import { CalendarDayCard } from './CalendarDayCard';
import { Session } from '@/types/training';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface CalendarGridProps {
  currentDate: Date;
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  sessions,
  onSessionClick,
}) => {
  const isMobile = useIsMobile();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isMobile) {
    // Mobile: vertical scrollable list
    return (
      <div className="space-y-4">
        {days
          .filter(day => isSameMonth(day, currentDate))
          .map((day) => (
            <div key={day.toISOString()} className="space-y-2">
              <div className="text-white/70 text-sm font-medium">
                {format(day, 'EEEE, MMMM d')}
              </div>
              <CalendarDayCard
                date={day}
                sessions={sessions}
                onClick={onSessionClick}
                isCurrentMonth={true}
              />
            </div>
          ))}
      </div>
    );
  }

  // Desktop: 7x5 grid
  return (
    <div className="space-y-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-4">
        {weekdays.map((weekday) => (
          <div 
            key={weekday} 
            className="text-center text-sm font-medium text-white/70 py-2"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => (
          <CalendarDayCard
            key={day.toISOString()}
            date={day}
            sessions={sessions}
            onClick={onSessionClick}
            isCurrentMonth={isSameMonth(day, currentDate)}
          />
        ))}
      </div>
    </div>
  );
};