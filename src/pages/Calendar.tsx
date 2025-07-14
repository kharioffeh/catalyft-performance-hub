
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions } from '@/hooks/useSessions';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { SessionDrawer } from '@/components/SessionDrawer';
import { Session } from '@/types/training';
import { useIsMobile } from '@/hooks/useBreakpoint';

// Session interface is now imported from types/training.ts

const Calendar: React.FC = () => {
  const { profile } = useAuth();
  const { data: sessions = [], isLoading } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const calendarEvents = sessions.map((session) => ({
    id: session.id,
    title: session.title || 'Training Session',
    start: session.planned_at,
    allDay: true, // Since we only have date, not specific time
    backgroundColor: getEventColor(session.status),
    borderColor: getEventColor(session.status),
    extendedProps: {
      session: session,
    },
  }));

  const getEventColor = (status?: string) => {
    switch (status) {
      case 'in-progress':
        return '#3B82F6'; // blue
      case 'completed':
        return '#10B981'; // green
      case 'scheduled':
      default:
        return '#6B7280'; // gray
    }
  };

  const handleEventClick = (info: any) => {
    const session = info.event.extendedProps.session;
    setSelectedSession(session);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={isMobile ? "listWeek" : "dayGridMonth"}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,listWeek'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          eventContent={(eventInfo) => (
            <div className="p-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="font-medium text-sm text-white truncate">
                {eventInfo.event.title}
              </div>
              <div className="text-xs text-white/80 truncate">
                {eventInfo.event.extendedProps.session.status === 'in-progress' ? 'In Progress' :
                 eventInfo.event.extendedProps.session.status === 'completed' ? 'Completed' :
                 'Scheduled'}
              </div>
            </div>
          )}
          dayMaxEvents={3}
          moreLinkClick="popover"
        />
      </div>

      {/* Session Drawer */}
      <SessionDrawer
        session={selectedSession}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
};

export default Calendar;
