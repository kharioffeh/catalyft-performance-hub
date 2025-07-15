
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions, useUpdateSession } from '@/hooks/useSessions';
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
  const { data: sessions = [], isLoading, refetch } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const updateSession = useUpdateSession();
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
      case 'active':
        return '#3B82F6'; // blue
      case 'completed':
        return '#10B981'; // green
      case 'planned':
      default:
        return '#6B7280'; // gray
    }
  };

  const handleEventClick = (info: any) => {
    const session = info.event.extendedProps.session;
    setSelectedSession(session);
    setIsDrawerOpen(true);
  };

  const handleEventDrop = async (info: any) => {
    const sessionId = info.event.id;
    const newDate = info.event.start.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const session = info.event.extendedProps.session;

    try {
      // Validate that the new date doesn't exceed the program end date
      if (session.program?.end_date && newDate > session.program.end_date) {
        info.revert();
        console.error(`Cannot reschedule session beyond program end date (${session.program.end_date})`);
        // You could show a toast notification here
        return;
      }

      // Update the session with the new planned_at date
      await updateSession.mutateAsync({
        id: sessionId,
        planned_at: newDate,
      });

      // Success - sessions will be automatically updated via React Query
    } catch (error) {
      // Revert the event if the request failed
      info.revert();
      console.error('Error rescheduling session:', error);
      // You could show a toast notification here
    }
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
          eventDrop={handleEventDrop}
          editable={true}
          height="auto"
          eventDisplay="block"
          eventContent={(eventInfo) => (
            <div className="p-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="font-medium text-sm text-white truncate">
                {eventInfo.event.title}
              </div>
              <div className="text-xs text-white/80 truncate">
                {eventInfo.event.extendedProps.session.status === 'active' ? 'Active' :
                 eventInfo.event.extendedProps.session.status === 'completed' ? 'Completed' :
                 'Planned'}
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
