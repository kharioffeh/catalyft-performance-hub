import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { Clock, User, Activity } from 'lucide-react';
import { Session } from '@/types/training';
import { cn } from '@/lib/utils';

interface CalendarDayCardProps {
  date: Date;
  sessions: Session[];
  onClick?: (session: Session) => void;
  isCurrentMonth?: boolean;
}

export const CalendarDayCard: React.FC<CalendarDayCardProps> = ({
  date,
  sessions,
  onClick,
  isCurrentMonth = true,
}) => {
  const dayNumber = format(date, 'd');
  const isToday_ = isToday(date);
  const daySessions = sessions.filter(session => 
    session.planned_at && isSameDay(new Date(session.planned_at), date)
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-400 bg-blue-400/10';
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'planned':
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div 
      className={cn(
        "h-32 md:h-40 p-3 rounded-2xl transition-all duration-300 cursor-pointer group",
        "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl",
        "hover:bg-white/15 hover:border-electric-blue/40 hover:shadow-electric-blue/20",
        isToday_ && "border-electric-blue/60 bg-electric-blue/10",
        !isCurrentMonth && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span 
          className={cn(
            "text-lg font-semibold",
            isToday_ ? "text-electric-blue" : "text-white",
            !isCurrentMonth && "text-white/50"
          )}
        >
          {dayNumber}
        </span>
        {isToday_ && (
          <div className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
        )}
      </div>

      <div className="space-y-1 overflow-hidden">
        {daySessions.length > 0 ? (
          daySessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              onClick={() => onClick?.(session)}
              className={cn(
                "p-2 rounded-lg text-xs transition-all duration-200",
                "border border-white/10 hover:border-white/30",
                getStatusColor(session.status)
              )}
            >
              <div className="flex items-center gap-1 mb-1">
                <Activity className="h-3 w-3" />
                <span className="font-medium truncate">
                  {session.title || 'Training Session'}
                </span>
              </div>
              {session.status && (
                <div className="flex items-center gap-1 opacity-75">
                  <Clock className="h-2.5 w-2.5" />
                  <span className="capitalize">{session.status}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-16 text-white/40 text-xs">
            No sessions
          </div>
        )}
        
        {daySessions.length > 3 && (
          <div className="text-xs text-electric-blue font-medium">
            +{daySessions.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};