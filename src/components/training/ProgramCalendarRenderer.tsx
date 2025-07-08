import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek } from 'date-fns';
import GlassCard from '@/components/ui/GlassCard';
import { ProgramPatch, ProgramCalendarWeek, ProgramCalendarDay } from '@/types/programPatch';
import { Badge } from '@/components/ui/badge';
import { Clock, Dumbbell, Heart, Target } from 'lucide-react';

interface ProgramCalendarRendererProps {
  programPatch: ProgramPatch;
  className?: string;
}

export const ProgramCalendarRenderer: React.FC<ProgramCalendarRendererProps> = ({
  programPatch,
  className = ""
}) => {
  const calendarWeeks = useMemo(() => {
    if (!programPatch) return [];

    const weeks: ProgramCalendarWeek[] = [];
    const startDate = new Date(programPatch.start_date);
    
    for (let weekNum = 1; weekNum <= programPatch.total_weeks; weekNum++) {
      const weekStart = addDays(startOfWeek(startDate), (weekNum - 1) * 7);
      const weekEnd = addDays(weekStart, 6);
      
      // Find the mesocycle for this week
      const mesocycle = programPatch.mesocycles.find(m => 
        weekNum >= m.start_week && weekNum < m.start_week + m.weeks
      );
      
      const days: ProgramCalendarDay[] = [];
      
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = addDays(weekStart, dayOffset);
        const dayOfWeek = currentDate.getDay() || 7; // 1-7 (Monday-Sunday)
        
        // Find sessions for this day and week
        const sessions = mesocycle?.sessions.filter(s => 
          s.week === weekNum && s.day === dayOfWeek
        ) || [];
        
        days.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          weekday: format(currentDate, 'EEE'),
          dateLabel: format(currentDate, 'd'),
          sessions,
          mesocycleLabel: mesocycle?.label,
          weekNumber: weekNum
        });
      }
      
      weeks.push({
        weekNumber: weekNum,
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(weekEnd, 'yyyy-MM-dd'),
        mesocycleLabel: mesocycle?.label || `Week ${weekNum}`,
        days
      });
    }
    
    return weeks;
  }, [programPatch]);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'conditioning':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'recovery':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'technical':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'assessment':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Dumbbell className="w-3 h-3" />;
      case 'conditioning':
        return <Heart className="w-3 h-3" />;
      case 'recovery':
        return <Clock className="w-3 h-3" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  if (!programPatch) {
    return (
      <div className="text-center text-white/60 py-8">
        No program data available
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Program Header */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{programPatch.name}</h2>
            <p className="text-white/60 text-sm">
              {programPatch.total_weeks} weeks • {programPatch.mesocycles.length} mesocycles
            </p>
          </div>
          <div className="flex gap-2">
            {programPatch.mesocycles.map((mesocycle, index) => (
              <Badge 
                key={mesocycle.id}
                variant="outline"
                className="text-xs"
              >
                {mesocycle.label}
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Calendar Grid */}
      <div className="space-y-6">
        {calendarWeeks.map((week, weekIndex) => (
          <motion.div
            key={week.weekNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: weekIndex * 0.1 }}
            className="space-y-3"
          >
            {/* Week Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/70">
                Week {week.weekNumber} • {week.mesocycleLabel}
              </h3>
              <span className="text-xs text-white/50">
                {format(new Date(week.start), 'MMM d')} - {format(new Date(week.end), 'MMM d')}
              </span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 md:gap-3">
              {week.days.map((day) => (
                <GlassCard
                  key={day.date}
                  className="p-3 text-center min-h-[100px] hover:bg-white/10 transition-colors"
                >
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-white/80">{day.weekday}</p>
                      <p className="text-lg font-bold text-white">{day.dateLabel}</p>
                    </div>

                    {/* Sessions */}
                    <div className="space-y-1">
                      {day.sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`
                            px-2 py-1 rounded text-xs border 
                            ${getSessionTypeColor(session.type)}
                            flex items-center gap-1 justify-center
                          `}
                          title={`${session.title} - ${session.exercises.length} exercises`}
                        >
                          {getSessionIcon(session.type)}
                          <span className="truncate">{session.title}</span>
                        </div>
                      ))}
                      
                      {day.sessions.length === 0 && (
                        <div className="h-6 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};