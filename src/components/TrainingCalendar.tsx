
import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getEventColor, handleEventDrop, handleEventResize } from '@/utils/calendarUtils';
import { QueryClient } from '@tanstack/react-query';

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

interface TrainingCalendarProps {
  sessions: Session[];
  isLoading: boolean;
  queryClient: QueryClient;
}

const TrainingCalendar = ({ sessions, isLoading, queryClient }: TrainingCalendarProps) => {
  const calendarEvents = sessions.map((session) => ({
    id: session.id,
    title: `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} - ${session.athletes?.name || 'Unknown Athlete'}`,
    start: session.start_ts,
    end: session.end_ts,
    backgroundColor: getEventColor(session.type),
    borderColor: getEventColor(session.type),
    extendedProps: {
      sessionType: session.type,
      athleteName: session.athletes?.name,
      notes: session.notes,
    },
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      events={calendarEvents}
      editable={true}
      droppable={true}
      eventDrop={(info) => handleEventDrop(info, queryClient)}
      eventResize={(info) => handleEventResize(info, queryClient)}
      height="auto"
      slotMinTime="06:00:00"
      slotMaxTime="22:00:00"
      allDaySlot={false}
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }}
      eventContent={(eventInfo) => (
        <div className="p-1">
          <div className="font-medium text-xs text-black">
            {eventInfo.timeText}
          </div>
          <div className="text-xs text-black truncate">
            {eventInfo.event.extendedProps.sessionType.charAt(0).toUpperCase() + 
             eventInfo.event.extendedProps.sessionType.slice(1)}
          </div>
          <div className="text-xs text-black truncate">
            {eventInfo.event.extendedProps.athleteName}
          </div>
        </div>
      )}
    />
  );
};

export default TrainingCalendar;
