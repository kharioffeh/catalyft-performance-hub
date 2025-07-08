import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Grid } from 'lucide-react';
import { ProgramCalendarRenderer } from './ProgramCalendarRenderer';
import { ProgramPatch } from '@/types/programPatch';
import GlassCard from '@/components/ui/GlassCard';

interface ProgramCalendarPagerProps {
  programs: ProgramPatch[];
  className?: string;
}

export const ProgramCalendarPager: React.FC<ProgramCalendarPagerProps> = ({
  programs,
  className = ""
}) => {
  const [currentProgramIndex, setCurrentProgramIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const currentProgram = programs[currentProgramIndex];

  const handlePrevious = () => {
    setCurrentProgramIndex((prev) => 
      prev > 0 ? prev - 1 : programs.length - 1
    );
  };

  const handleNext = () => {
    setCurrentProgramIndex((prev) => 
      prev < programs.length - 1 ? prev + 1 : 0
    );
  };

  if (!programs || programs.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="space-y-4">
          <Calendar className="w-12 h-12 text-white/40 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-white/80">No Programs Available</h3>
            <p className="text-white/60 text-sm">
              Create your first training program to see it visualized here.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {programs.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="bg-white/5 hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-white/70 px-3">
                {currentProgramIndex + 1} of {programs.length}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="bg-white/5 hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? '' : 'bg-white/5 hover:bg-white/10'}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? '' : 'bg-white/5 hover:bg-white/10'}
          >
            <Grid className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Program Content */}
      {viewMode === 'calendar' ? (
        <ProgramCalendarRenderer 
          programPatch={currentProgram}
          className="min-h-[600px]"
        />
      ) : (
        <ProgramListView program={currentProgram} />
      )}
    </div>
  );
};

// Simple list view component
const ProgramListView: React.FC<{ program: ProgramPatch }> = ({ program }) => {
  return (
    <div className="space-y-4">
      {program.mesocycles.map((mesocycle) => (
        <GlassCard key={mesocycle.id} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">{mesocycle.label}</h3>
              <span className="text-sm text-white/60">
                {mesocycle.weeks} weeks • Week {mesocycle.start_week}-{mesocycle.start_week + mesocycle.weeks - 1}
              </span>
            </div>
            
            <p className="text-sm text-white/70">Focus: {mesocycle.focus}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mesocycle.sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-md bg-white/5 border border-white/10"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">{session.title}</h4>
                      <span className="text-xs text-white/60 capitalize">{session.type}</span>
                    </div>
                    <p className="text-xs text-white/60">
                      Week {session.week}, Day {session.day} • {session.exercises.length} exercises
                    </p>
                    {session.duration_minutes && (
                      <p className="text-xs text-white/50">
                        ~{session.duration_minutes} minutes
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};