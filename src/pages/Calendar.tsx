
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

const Calendar = () => {
  const { user, profile, loading, signOut } = useAuth();
  const queryClient = useQueryClient();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          athletes (
            name
          )
        `)
        .order('start_ts', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      return data as Session[];
    },
  });

  const getEventColor = (type: string) => {
    switch (type) {
      case 'strength':
        return '#00FF7B';
      case 'technical':
        return '#5BAFFF';
      case 'recovery':
        return '#FFCB5B';
      default:
        return '#6B7280';
    }
  };

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

  const handleEventDrop = async (info: any) => {
    const sessionId = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          start_ts: newStart.toISOString(),
          end_ts: newEnd.toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session:', error);
        info.revert();
        toast({
          title: "Error",
          description: "Failed to update session time",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Session time updated successfully",
      });

      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      console.error('Error updating session:', error);
      info.revert();
      toast({
        title: "Error",
        description: "Failed to update session time",
        variant: "destructive",
      });
    }
  };

  const handleEventResize = async (info: any) => {
    const sessionId = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          start_ts: newStart.toISOString(),
          end_ts: newEnd.toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session:', error);
        info.revert();
        toast({
          title: "Error",
          description: "Failed to update session duration",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Session duration updated successfully",
      });

      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      console.error('Error updating session:', error);
      info.revert();
      toast({
        title: "Error",
        description: "Failed to update session duration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Training Calendar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {profile?.full_name || user.email}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Sessions</h2>
            <div className="flex space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00FF7B' }}></div>
                <span className="ml-2">Strength</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5BAFFF' }}></div>
                <span className="ml-2">Technical</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFCB5B' }}></div>
                <span className="ml-2">Recovery</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
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
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
