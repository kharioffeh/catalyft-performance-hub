
import React from 'react';
import { WorkoutTemplates } from '@/components/WorkoutTemplates';

interface TrainingProgramsProgramsTabProps {
  workoutTemplates: any[];
  isCoach: boolean;
  onAssignTemplate: (template: any) => void;
}

export const TrainingProgramsProgramsTab: React.FC<TrainingProgramsProgramsTabProps> = ({
  workoutTemplates,
  isCoach,
  onAssignTemplate,
}) => {
  return (
    <WorkoutTemplates
      templates={workoutTemplates}
      isLoading={false}
      isCoach={isCoach}
      onAssignTemplate={onAssignTemplate}
    />
  );
};
