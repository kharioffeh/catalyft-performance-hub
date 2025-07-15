
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProgramMeta, ProgramSession } from '@/hooks/useEnhancedProgramBuilder';
import { Plus, Sparkles } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ProgramSessionCard } from './ProgramSessionCard';
import { ExerciseLibraryDrawer } from '../training-plan/builder/ExerciseLibraryDrawer';
import { useGenerateProgram } from '@/hooks/useProgramTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProgramBlocksStepProps {
  meta: ProgramMeta;
  sessions: ProgramSession[];
  setSessions: (sessions: ProgramSession[]) => void;
  addSession: (week: number, day: number) => void;
  getSessionsForWeekDay: (week: number, day: number) => ProgramSession[];
  onPrev: () => void;
  onNext: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ProgramBlocksStep: React.FC<ProgramBlocksStepProps> = ({
  meta,
  sessions,
  setSessions,
  addSession,
  getSessionsForWeekDay,
  onPrev,
  onNext
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    // Handle session reordering logic here
    setActiveId(null);
  };

  const handleAIGenerate = async () => {
    if (!profile?.id) return;
    
    setIsGenerating(true);
    try {
      // Create a mock athlete UUID for generation (in real app, would select from list)
      const mockAthleteId = profile.id;
      
      // Call the generate program function - this would ideally populate our sessions
      // For now, we'll create a basic structure based on the meta
      const generatedSessions: ProgramSession[] = [];
      
      // Generate basic session structure based on goal and weeks
      for (let week = 1; week <= meta.weeks; week++) {
        const sessionsPerWeek = meta.goal === 'strength' ? 3 : meta.goal === 'endurance' ? 5 : 4;
        
        for (let day = 0; day < sessionsPerWeek; day++) {
          const sessionDay = day * 2; // Space sessions every other day
          if (sessionDay < 7) {
            generatedSessions.push({
              id: `ai-session-${week}-${sessionDay}-${Date.now()}`,
              title: `${meta.goal.charAt(0).toUpperCase() + meta.goal.slice(1)} Session`,
              day: sessionDay,
              week,
              exercises: [] // Would be populated by AI
            });
          }
        }
      }
      
      setSessions(generatedSessions);
      
      toast({
        title: "Program Generated",
        description: "ARIA has created a program structure based on your specifications",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Build Your Program</h2>
          <p className="text-white/70">Create sessions for your weekly schedule</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </Button>
          <Button
            onClick={() => setDrawerOpen(true)}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Exercise Library
          </Button>
        </div>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-3 mb-4">
                <div className="font-medium text-white/70 text-sm">Week</div>
                {DAYS.map(day => (
                  <div key={day} className="font-medium text-white/70 text-sm text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Week Rows */}
              {Array.from({ length: meta.weeks }, (_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-8 gap-3 mb-3">
                  <div className="flex items-center justify-center bg-white/5 rounded-lg p-2 text-white/90 font-medium">
                    {weekIndex + 1}
                  </div>
                  {DAYS.map((day, dayIndex) => {
                    const weekSessions = getSessionsForWeekDay(weekIndex + 1, dayIndex);
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="min-h-[100px] bg-white/5 rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 transition-colors p-2"
                      >
                        <SortableContext items={weekSessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
                          {weekSessions.map(session => (
                            <ProgramSessionCard key={session.id} session={session} />
                          ))}
                        </SortableContext>
                        
                        {weekSessions.length === 0 && (
                          <button
                            onClick={() => addSession(weekIndex + 1, dayIndex)}
                            className="w-full h-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-indigo-600/20 border border-indigo-500/50 rounded-lg p-3 backdrop-blur-sm">
              Dragging session...
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-between">
        <Button
          onClick={onPrev}
          variant="outline"
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          Previous Step
        </Button>
        <Button
          onClick={onNext}
          disabled={sessions.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8"
        >
          Review Program
        </Button>
      </div>

      <ExerciseLibraryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};
