
import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/ui/sortable-item';
import { useAuth } from '@/contexts/AuthContext';
import { useSessions, useUpdateSession } from '@/hooks/useSessions';
import { SessionDrawer } from '@/components/SessionDrawer';
import { Session } from '@/types/training';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { GlassContainer } from '@/components/Glass/GlassContainer';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Calendar as CalendarIcon, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface SessionCardProps {
  session: Session;
  onClick: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
  const startTime = new Date(session.start_ts).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const getLoadBorderColor = (loadPercent?: number): string => {
    if (loadPercent === undefined) return 'rgba(255, 255, 255, 0.2)';
    
    // Color gradient from green (low load) to red (high load)
    const hue = Math.max(0, 120 - (120 * loadPercent) / 100);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength':
        return <Target className="w-4 h-4 text-red-400" />;
      case 'cardio':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'mobility':
        return <Zap className="w-4 h-4 text-green-400" />;
      default:
        return <Target className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border cursor-pointer transition-all duration-200",
        "bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10",
        "hover:scale-[1.02] hover:shadow-lg group"
      )}
      style={{
        borderLeftColor: session.isPR ? '#FFD700' : getLoadBorderColor(session.loadPercent),
        borderLeftWidth: '4px'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{startTime}</span>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs bg-white/10 hover:bg-white/20 border-white/20"
          >
            {getSessionTypeIcon(session.type)}
            <span className="ml-1">{session.type}</span>
          </Badge>
        </div>
        
        {session.isPR && (
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">PR</span>
          </div>
        )}
      </div>
      
      {session.notes && (
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{session.notes}</p>
      )}
      
      {session.loadPercent !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Training Load</span>
            <span className="font-medium text-white">{session.loadPercent}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-green-400 to-blue-500"
              style={{ width: `${session.loadPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CalendarPage: React.FC = () => {
  const { profile } = useAuth();
  const { data: allSessions = [], isLoading, refetch } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const updateSession = useUpdateSession();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter sessions to only show current user's sessions
  const mySessions = useMemo(() => 
    allSessions.filter(session => 
      profile && session.user_uuid === profile.id
    ), [allSessions, profile]
  );

  // Get sessions for the selected date
  const selectedDateSessions = useMemo(() => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return mySessions.filter(session => {
      const sessionDate = new Date(session.start_ts).toISOString().split('T')[0];
      return sessionDate === selectedDateString;
    }).sort((a, b) => new Date(a.start_ts).getTime() - new Date(b.start_ts).getTime());
  }, [mySessions, selectedDate]);

  // Get dates that have sessions for calendar tile styling
  const datesWithSessions = useMemo(() => {
    const dates = new Set<string>();
    mySessions.forEach(session => {
      const date = new Date(session.start_ts).toISOString().split('T')[0];
      dates.add(date);
    });
    return dates;
  }, [mySessions]);

  // Get dates with PR sessions
  const datesWithPR = useMemo(() => {
    const dates = new Set<string>();
    mySessions.forEach(session => {
      if (session.isPR) {
        const date = new Date(session.start_ts).toISOString().split('T')[0];
        dates.add(date);
      }
    });
    return dates;
  }, [mySessions]);

  const handleSessionClick = (session: Session) => {
    if (profile && session.user_uuid === profile.id) {
      setSelectedSession(session);
      setIsDrawerOpen(true);
    }
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = selectedDateSessions.findIndex(session => session.id === active.id);
      const newIndex = selectedDateSessions.findIndex(session => session.id === over?.id);
      
      const reorderedSessions = arrayMove(selectedDateSessions, oldIndex, newIndex);
      
      try {
        // Update each session with new timing based on order
        const baseDate = new Date(selectedDate);
        const promises = reorderedSessions.map(async (session, index) => {
          // Space sessions 2 hours apart starting from 8 AM
          const newStartTime = new Date(baseDate);
          newStartTime.setHours(8 + (index * 2), 0, 0, 0);
          
          const newEndTime = new Date(newStartTime);
          newEndTime.setHours(newStartTime.getHours() + 1); // 1 hour sessions
          
          return updateSession.mutateAsync({
            id: session.id,
            start_ts: newStartTime.toISOString(),
            end_ts: newEndTime.toISOString(),
          });
        });
        
        await Promise.all(promises);
        await refetch();
      } catch (error) {
        console.error('Failed to reorder sessions:', error);
      }
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0];
    const hasSessions = datesWithSessions.has(dateString);
    const hasPR = datesWithPR.has(dateString);

    if (!hasSessions) return null;

    return (
      <div className="flex justify-center mt-1">
        <div 
          className={cn(
            "w-2 h-2 rounded-full",
            hasPR ? "bg-yellow-400" : "bg-blue-400"
          )}
        />
      </div>
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const hasSessions = datesWithSessions.has(dateString);
    
    return cn(
      "calendar-tile",
      hasSessions && "has-sessions",
      dateString === selectedDateString && "selected",
      dateString === today && "today"
    );
  };

  if (isLoading) {
    return (
      <GlassLayout variant="dashboard">
        <GlassContainer className="min-h-screen">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Loading calendar...</div>
          </div>
        </GlassContainer>
      </GlassLayout>
    );
  }

  return (
    <GlassLayout variant="dashboard">
      <GlassContainer className="min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Training Calendar</h1>
            <p className="text-white/70">Plan and track your training sessions</p>
          </div>

          {/* Calendar */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <div className="calendar-container">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="custom-calendar"
              />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-sm text-white">Normal Session</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm text-white">PR Day</span>
              </div>
            </div>
          </div>

          {/* Selected Date Sessions */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-semibold text-white">
                Sessions for {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            
            {selectedDateSessions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                  <span>Drag and drop to reorder sessions</span>
                </div>
                
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                  <SortableContext 
                    items={selectedDateSessions.map(s => s.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {selectedDateSessions.map(session => (
                        <SortableItem key={session.id} id={session.id}>
                          <SessionCard 
                            session={session} 
                            onClick={() => handleSessionClick(session)}
                          />
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 text-white/20 mb-4">
                  <CalendarIcon className="w-full h-full" />
                </div>
                <p className="text-white/60 text-lg mb-2">No sessions scheduled</p>
                <p className="text-white/40">Tap the calendar to select a different date or add new sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Session Drawer */}
        <SessionDrawer
          session={selectedSession}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />

        <style jsx>{`
          .custom-calendar {
            width: 100%;
            background: transparent;
            border: none;
            color: white;
          }
          
          .custom-calendar .react-calendar__navigation {
            margin-bottom: 1.5rem;
          }
          
          .custom-calendar .react-calendar__navigation button {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 0.75rem;
            padding: 0.75rem;
            margin: 0 0.25rem;
            transition: all 0.2s ease;
          }
          
          .custom-calendar .react-calendar__navigation button:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
          }
          
          .custom-calendar .react-calendar__month-view__weekdays {
            color: rgba(255, 255, 255, 0.7);
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          
          .custom-calendar .react-calendar__tile {
            color: white;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1rem 0.5rem;
            position: relative;
            border-radius: 0.75rem;
            margin: 0.125rem;
            transition: all 0.2s ease;
            min-height: 4rem;
          }
          
          .custom-calendar .react-calendar__tile:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
          
          .custom-calendar .react-calendar__tile--active {
            background: rgba(99, 102, 241, 0.3) !important;
            border-color: #6366F1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
          }
          
          .custom-calendar .react-calendar__tile--now {
            background: rgba(99, 102, 241, 0.2);
            border-color: #6366F1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
          }
          
          .custom-calendar .react-calendar__tile.has-sessions {
            border-color: rgba(99, 102, 241, 0.5);
            background: rgba(99, 102, 241, 0.1);
          }
          
          .custom-calendar .react-calendar__tile.today {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
            border-color: #6366F1;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
        `}</style>
      </GlassContainer>
    </GlassLayout>
  );
};

export default CalendarPage;
