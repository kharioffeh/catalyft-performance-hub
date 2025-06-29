
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BuilderMeta, BuilderSession, useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { Plus, Sparkles } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SessionCard } from './SessionCard';
import { ExerciseLibraryDrawer } from './ExerciseLibraryDrawer';

interface BlocksStepProps {
  meta: BuilderMeta;
  sessions: BuilderSession[];
  setSessions: (sessions: BuilderSession[]) => void;
  addSession: (week: number, day: number) => void;
  getSessionsForWeekDay: (week: number, day: number) => BuilderSession[];
  onPrev: () => void;
  onNext: () => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const BlocksStep: React.FC<BlocksStepProps> = ({
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

  const handleAIAutoFill = async () => {
    // TODO: Call edge function to generate template structure
    console.log('AI Auto-Fill triggered for:', meta);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Build Your Blocks</h2>
          <p className="text-white/70">Drag sessions into your weekly schedule</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAIAutoFill}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Auto-Fill
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
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 overflow-x-auto">
          {/* Calendar Grid */}
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
                          <SessionCard key={session.id} session={session} />
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
          Review Template
        </Button>
      </div>

      <ExerciseLibraryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};
