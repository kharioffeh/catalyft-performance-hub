import React from 'react';
import { Button } from '@/components/ui/button';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useNavigate } from 'react-router-dom';
import { Exercise } from '@/types/exercise';
import { Play } from 'lucide-react';

interface StartWorkoutButtonProps {
  exercises: Exercise[];
  workoutName?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const StartWorkoutButton: React.FC<StartWorkoutButtonProps> = ({
  exercises,
  workoutName = 'Quick Workout',
  variant = 'default',
  size = 'default',
  className
}) => {
  const { startWorkout, activeWorkout } = useWorkout();
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    if (exercises.length === 0) return;
    
    startWorkout(exercises, workoutName);
    navigate('/training/live');
  };

  if (activeWorkout) {
    return (
      <Button
        onClick={() => navigate('/training/live')}
        variant="outline"
        size={size}
        className={className}
      >
        <Play className="w-4 h-4 mr-2" />
        Resume Workout
      </Button>
    );
  }

  return (
    <Button
      onClick={handleStartWorkout}
      disabled={exercises.length === 0}
      variant={variant}
      size={size}
      className={className}
    >
      <Play className="w-4 h-4 mr-2" />
      Start Workout ({exercises.length})
    </Button>
  );
};