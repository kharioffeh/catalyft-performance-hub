
import React from 'react';
import { TrainingProgramsProgramsTab } from '@/components/TrainingPrograms/TrainingProgramsProgramsTab';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useAuth } from '@/contexts/AuthContext';

export const ProgramsTab: React.FC = () => {
  const { profile } = useAuth();
  const { data: workoutTemplates = [], isLoading } = useWorkoutTemplates();

  const isCoach = profile?.role === 'coach';

  const handleAssignTemplate = (template: any) => {
    console.log('Assign template:', template);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TrainingProgramsProgramsTab
      workoutTemplates={workoutTemplates}
      isCoach={isCoach}
      onAssignTemplate={handleAssignTemplate}
    />
  );
};
