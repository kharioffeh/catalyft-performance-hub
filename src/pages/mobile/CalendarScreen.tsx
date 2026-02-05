import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell } from 'lucide-react';
import { useCalendar } from '@/hooks/useCalendar';
import { Session } from '@/types/training';

interface CalendarDay {
  date: Date;
  sessions: Session[];
  isCurrentMonth: boolean;
}

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const startTime = format(new Date(session.start_ts), 'HH:mm');
  
  const getLoadBorderColor = (loadPercent?: number): string => {
    if (loadPercent === undefined) return 'border-white/20';
    
    // HSL formula: hsl(120 - 120*loadPercent/100, 80%, 60%)
    const hue = Math.max(0, 120 - (120 * loadPercent) / 100);
    return `hsl(${hue}, 80%, 60%)`;
  };

  const getLoadInfo = (session: Session): string => {
    const loadText = session.loadPercent !== undefined ? `Load: ${session.loadPercent}%` : 'Load: N/A';
    const prText = session.isPR ? ' • PR' : '';
    return loadText + prText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'border-green-500';
      case 'completed': return 'border-gray-500';
      default: return 'border-blue-500';
    }
  };

  const handleSessionClick = () => {
    if (session.status === 'planned' || session.status === 'active') {
      // In a real app, you would navigate to the ActiveSessionScreen
      // For web, you might open a modal or navigate to a session page
      // Example: router.push(`/session/${session.id}`);
    }
  };

  const borderColor = session.isPR ? 'border-electric-blue' : getStatusColor(session.status);
  const customBorderColor = !session.isPR ? getLoadBorderColor(session.loadPercent) : '';
  
  return (
    <div 
      className={`
        mb-1 px-2 py-1 rounded-lg bg-white/10 border-2 relative
        ${borderColor || 'border-white/20'}
        hover:bg-white/15 transition-colors cursor-pointer
        ${(session.status === 'planned' || session.status === 'active') ? 'hover:scale-105' : ''}
      `}
      style={customBorderColor !== 'border-white/20' ? { borderColor: customBorderColor } : {}}
      title={getLoadInfo(session)}
      onClick={handleSessionClick}
    >
      <div className="flex items-center gap-1 relative">
        <Dumbbell size={10} className="text-electric-blue" />
        <span className="text-xs text-white font-medium">
          {startTime}
        </span>
        <span className="text-xs text-white/70 capitalize">
          {session.type}
        </span>
        
        {/* Status indicator */}
        {session.status === 'active' && (
          <span className="absolute -top-1 -right-1 text-xs">🟢</span>
        )}
        {session.status === 'planned' && (
          <span className="absolute -top-1 -right-1 text-xs">▶️</span>
        )}
        
        {/* PR Badge */}
        {session.isPR && (
          <span className="absolute -top-1 -right-1 text-sm">🏅</span>
        )}
      </div>
      
      {/* Session hint */}
      {session.status === 'planned' && (
        <div className="text-xs text-blue-300 mt-1">Tap to start</div>
      )}
      {session.status === 'active' && (
        <div className="text-xs text-green-300 mt-1">In progress</div>
      )}
    </div>
  );
};

interface DayCardProps {
  day: CalendarDay;
  isWeekView?: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, isWeekView = false }) => {
  const isToday_ = isToday(day.date);
  const dayNumber = format(day.date, 'd');
  const weekdayLabel = format(day.date, 'EEE');
  const maxSessions = isWeekView ? 5 : 3;
  const visibleSessions = day.sessions.slice(0, maxSessions);
  const extraSessions = day.sessions.length - maxSessions;

  return (
    <button 
      className={`
        ${isWeekView ? 'w-24 h-32' : 'flex-1 h-24'} 
        m-1 p-3 rounded-2xl
        bg-white/5 backdrop-blur-md border border-white/10
        ${isToday_ ? 'border-electric-blue/60 bg-electric-blue/10' : ''}
        ${!day.isCurrentMonth ? 'opacity-50' : ''}
        hover:bg-white/10 transition-colors
      `}
    >
      <div className="flex items-center justify-between mb-2">
        {isWeekView && (
          <span className="text-xs text-white/70 font-medium">{weekdayLabel}</span>
        )}
        <span 
          className={`
            text-sm font-semibold
            ${isToday_ ? 'text-electric-blue' : 'text-white'}
            ${!day.isCurrentMonth ? 'text-white/50' : ''}
          `}
        >
          {dayNumber}
        </span>
        {isToday_ && (
          <div className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse" />
        )}
      </div>

      <div className="flex-1">
        {visibleSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
        
        {extraSessions > 0 && (
          <span className="text-xs text-electric-blue font-medium mt-1 block">
            +{extraSessions} more
          </span>
        )}
        
        {day.sessions.length === 0 && !isWeekView && (
          <span className="text-xs text-white/40 text-center mt-2 block">
            No sessions
          </span>
        )}
      </div>
    </button>
  );
};

export const CalendarScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { sessions, isLoading } = useCalendar();

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      
      const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      
      return days.map(day => ({
        date: day,
        sessions: sessions.filter(session => 
          session.planned_at && isSameDay(new Date(session.planned_at), day)
        ),
        isCurrentMonth: day >= monthStart && day <= monthEnd
      }));
    } else {
      // Week view
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(weekStart);
      
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(day => ({
        date: day,
        sessions: sessions.filter(session => 
          session.planned_at && isSameDay(new Date(session.planned_at), day)
        ),
        isCurrentMonth: true
      }));
    }
  }, [currentDate, sessions, viewMode]);

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };

  const monthLabel = format(currentDate, 'MMMM yyyy');
  const weekLabel = `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`;

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-pulse" />
        <span className="text-white/70 mt-4">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl mx-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon size={24} className="text-electric-blue" />
            <h1 className="text-xl font-bold text-white">
              {viewMode === 'month' ? monthLabel : weekLabel}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} className="text-electric-blue" />
            </button>
            
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} className="text-electric-blue" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={`
              flex-1 py-2 px-4 rounded-md text-center transition-colors
              ${viewMode === 'month' ? 'bg-electric-blue text-white' : 'bg-transparent text-white/70 hover:text-white'}
            `}
          >
            Month
          </button>
          
          <button
            onClick={() => setViewMode('week')}
            className={`
              flex-1 py-2 px-4 rounded-md text-center transition-colors
              ${viewMode === 'week' ? 'bg-electric-blue text-white' : 'bg-transparent text-white/70 hover:text-white'}
            `}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 p-4">
        {viewMode === 'month' ? (
          <div className="flex-1">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
                <div key={weekday} className="text-center py-2">
                  <span className="text-sm font-medium text-white/70">{weekday}</span>
                </div>
              ))}
            </div>
            
            {/* Month Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <DayCard key={index} day={day} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-2">
            {calendarDays.map((day, index) => (
              <DayCard key={index} day={day} isWeekView />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};