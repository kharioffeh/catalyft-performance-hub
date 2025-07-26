
import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgendaList } from '@/components/Calendar/AgendaList';
import { AgendaHeader } from '@/components/Calendar/AgendaHeader';
// CreateSessionDialog removed for solo experience
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  status?: string;
  athletes?: {
    name: string;
  };
}

interface Program {
  id: string;
  name: string;
  origin: string;
  block_json: any;
}

interface TrainingPlannerProps {
  sessions: Session[];
  programs: Program[];
  isLoading: boolean;
  isCoach: boolean;
}

export const TrainingPlanner: React.FC<TrainingPlannerProps> = ({
  sessions,
  programs,
  isLoading,
  isCoach,
}) => {
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => 
      isSameDay(new Date(session.start_ts), date)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
  };

  const getSessionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength':
        return 'bg-red-500/20 text-red-300';
      case 'conditioning':
        return 'bg-blue-500/20 text-blue-300';
      case 'recovery':
        return 'bg-green-500/20 text-green-300';
      case 'technical':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleSessionClick = (session: Session) => {
    console.log('Session clicked:', session);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Training Planner</h3>
            <p className="text-sm text-white/70">Plan and organize training sessions</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="text-xs"
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'agenda' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('agenda')}
                className="text-xs"
              >
                Agenda
              </Button>
            </div>

            {isCoach && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Plan Session
              </Button>
            )}
          </div>
        </div>

        {viewMode === 'week' ? (
          <>
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h4 className="text-lg font-semibold text-white">
                {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
              </h4>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="text-white hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const daySessions = getSessionsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <Card
                    key={day.toISOString()}
                    className={`bg-white/5 border-white/10 min-h-[120px] ${
                      isToday ? 'ring-2 ring-blue-500/50' : ''
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="text-center mb-2">
                        <div className="text-xs text-white/70 uppercase tracking-wide">
                          {format(day, 'EEE')}
                        </div>
                        <div className={`text-lg font-semibold ${
                          isToday ? 'text-blue-300' : 'text-white'
                        }`}>
                          {format(day, 'd')}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {daySessions.map((session) => (
                          <div
                            key={session.id}
                            className="text-xs p-2 rounded bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                            onClick={() => handleSessionClick(session)}
                          >
                            <div className="font-medium text-white capitalize">
                              {session.type}
                            </div>
                            <div className="text-white/70">
                              {format(new Date(session.start_ts), 'HH:mm')}
                            </div>
                            {session.athletes?.name && (
                              <div className="text-white/50 truncate">
                                {session.athletes.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <AgendaHeader 
              selectedDate={currentWeek}
              onDatePickerOpen={() => console.log('Date picker opened')}
            />
            <AgendaList 
              sessions={sessions}
              selectedDate={currentWeek}
              onSessionClick={handleSessionClick}
            />
          </div>
        )}
      </div>

      {/* Session creation dialog removed for solo experience */}
    </>
  );
};
