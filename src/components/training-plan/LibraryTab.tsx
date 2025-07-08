
import React, { useState } from 'react';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { ExerciseDetailSheet } from './ExerciseDetailSheet';
import { Exercise } from '@/types/exercise';

interface LibraryTabProps {
  onAddExercise?: (exercise: any) => void;
  selectedExercises?: string[];
}

export const LibraryTab: React.FC<LibraryTabProps> = ({ 
  onAddExercise,
  selectedExercises = []
}) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailSheetOpen(true);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (onAddExercise) {
      onAddExercise(exercise);
      setIsDetailSheetOpen(false);
    }
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false);
    setSelectedExercise(null);
  };

  return (
    <>
      <div className="h-full w-full">
        <ExerciseLibrary
          onExerciseSelect={handleExerciseSelect}
          selectedExercises={selectedExercises}
          className="h-full"
        />
      </div>

      <ExerciseDetailSheet
        exercise={selectedExercise}
        isOpen={isDetailSheetOpen}
        onClose={handleCloseDetailSheet}
        onAddToWorkout={onAddExercise ? handleAddExercise : undefined}
      />
    </>
  );
};
