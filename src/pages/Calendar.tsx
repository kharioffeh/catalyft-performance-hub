import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionsData } from '@/hooks/useSessionsData';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { GlassButton } from '@/components/Glass/GlassButton';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';
import DayDrawer from '@/components/DayDrawer';
import LegendBar from '@/components/LegendBar';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/useBreakpoint';
import clsx from 'clsx';
import { getEventColor } from '@/utils/calendarUtils';
import '@/styles/fullcalendar-glass.css';

const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { sessions, isLoading, queryClient } = useSessionsData(profile);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();

  const pillClasses = (type: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-1.5 py-0.5 border rounded-full truncate text-[11px] font-medium";
    
    switch (type) {
      case 'strength':
        return clsx(baseClasses, "bg-green-500/10 border-green-500/35 text-green-400");
      case 'technical':
        return clsx(baseClasses, "bg-blue-500/10 border-blue-500/35 text-blue-400");
      case 'recovery':
        return clsx(baseClasses, "bg-pink-500/10 border-pink-500/35 text-pink-400");
      default:
        return clsx(baseClasses, "bg-gray-500/10 border-gray-500/35 text-gray-400");
    }
  };

  const calendarEvents = sessions.map((session) => ({
    id: session.id,
    title: session.athletes?.name || 'Unknown Athlete',
    start: session.start_ts,
    end: session.end_ts,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    textColor: 'transparent',
    extendedProps: {
      sessionType: session.type,
      athleteName: session.athletes?.name,
      notes: session.notes,
      session: session,
      type: session.type,
    },
  }));

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <GlassContainer>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </GlassContainer>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <GlassContainer>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Training Calendar</h1>
          </div>
          {profile?.role === 'coach' && (
            <GlassButton
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 min-h-[44px] w-full sm:w-auto"
              size={isMobile ? "default" : "default"}
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </GlassButton>
          )}
        </div>
      </GlassContainer>

      <GlassContainer>
        <LegendBar />
      </GlassContainer>

      <div className="glass-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          events={calendarEvents}
          dayCellClassNames={() => "p-1.5"}
          dayCellContent={(arg) => {
            const dayEvents = calendarEvents.filter(event => {
              const eventDate = new Date(event.start);
              return eventDate.toDateString() === arg.date.toDateString();
            });

            return (
              <div 
                className="flex flex-col h-full min-h-[120px] bg-white/5 backdrop-blur-sm rounded-xl p-2 cursor-pointer border border-white/10 hover:bg-white/10 transition-all duration-200"
                onClick={() => setSelectedDate(arg.date)}
              >
                <span className="text-xs ml-auto text-white/80 font-medium mb-2">
                  {arg.dayNumberText}
                </span>
                <div className="flex flex-col gap-1 flex-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <span 
                      key={event.id}
                      className={pillClasses(event.extendedProps.type)}
                    >
                      {event.title}
                    </span>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-white/50 mt-1">
                      + {dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          }}
          dayMaxEvents={false}
          eventDisplay="none"
        />
      </div>

      <CreateSessionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        queryClient={queryClient}
      />

      {selectedDate && (
        <DayDrawer 
          date={selectedDate} 
          sessions={sessions}
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  );
};

export default Calendar;
