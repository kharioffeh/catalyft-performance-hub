import React, { useState, useEffect } from 'react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check,
  Plus,
  Minus,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const LiveWorkoutSession: React.FC = () => {
  const { 
    activeWorkout, 
    completeSet, 
    moveToNextSet, 
    moveToPreviousSet, 
    endWorkout, 
    pauseWorkout, 
    resumeWorkout 
  } = useWorkout();

  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [rpe, setRpe] = useState<number[]>([5]);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isRestActive, setIsRestActive] = useState(false);

  if (!activeWorkout) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96 text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">No Active Workout</h2>
            <p className="text-muted-foreground">Start a workout to use the live session tracker.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExercise = activeWorkout.exercises[activeWorkout.currentExerciseIndex];
  const currentSet = currentExercise?.sets[activeWorkout.currentSetIndex];
  const isLastSet = activeWorkout.currentSetIndex === currentExercise.sets.length - 1;
  const isLastExercise = activeWorkout.currentExerciseIndex === activeWorkout.exercises.length - 1;

  // Rest timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isRestActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsRestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestActive, restTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    if (!currentSet) return;

    completeSet(currentExercise.exercise.id, activeWorkout.currentSetIndex, {
      weight,
      reps,
      rpe: rpe[0],
    });

    // Start rest timer if not the last set
    if (!isLastSet || !isLastExercise) {
      startRestTimer();
    }

    // Auto-advance to next set
    setTimeout(() => {
      moveToNextSet();
    }, 500);
  };

  const startRestTimer = (duration = 90) => {
    setRestTimer(duration);
    setIsRestActive(true);
  };

  const skipRest = () => {
    setIsRestActive(false);
    setRestTimer(0);
  };

  const quickWeightAdjust = (amount: number) => {
    setWeight(prev => Math.max(0, prev + amount));
  };

  const quickRepsAdjust = (amount: number) => {
    setReps(prev => Math.max(0, prev + amount));
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">{activeWorkout.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(activeWorkout.totalDuration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Exercise {activeWorkout.currentExerciseIndex + 1} of {activeWorkout.exercises.length}
          </Badge>
          <Badge variant="outline">
            Set {activeWorkout.currentSetIndex + 1} of {currentExercise.sets.length}
          </Badge>
        </div>
      </div>

      {/* Rest Timer */}
      {isRestActive && (
        <Card className="mb-6 bg-accent border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                <span className="font-semibold">Rest Time</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatTime(restTimer)}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={skipRest}>
                Skip Rest
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRestTimer(prev => prev + 30)}>
                +30s
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentExercise.exercise.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Open exercise detail sheet */}}
            >
              View Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentExercise.exercise.muscle.map((muscle, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
          
          {/* Set Progress */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {currentExercise.sets.map((set, index) => (
              <div
                key={set.id}
                className={cn(
                  "p-3 rounded-lg border text-center",
                  index === activeWorkout.currentSetIndex 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : set.completed 
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-muted border-border"
                )}
              >
                <div className="text-xs font-medium mb-1">Set {set.setNumber}</div>
                {set.completed ? (
                  <div className="text-xs">
                    {set.reps}r @ {set.weight}kg
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Not started
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Controls */}
      <div className="space-y-4">
        {/* Weight Input */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-base font-semibold mb-3 block">Weight (kg)</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickWeightAdjust(-2.5)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="text-center text-lg font-semibold"
                placeholder="0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickWeightAdjust(2.5)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[2.5, 5, 10, 20].map(amount => (
                <Button
                  key={amount}
                  variant="ghost"
                  size="sm"
                  onClick={() => quickWeightAdjust(amount)}
                  className="text-xs"
                >
                  +{amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reps Input */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-base font-semibold mb-3 block">Reps</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickRepsAdjust(-1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="text-center text-lg font-semibold"
                placeholder="0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickRepsAdjust(1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {[5, 8, 10, 12, 15].map(repsCount => (
                <Button
                  key={repsCount}
                  variant="ghost"
                  size="sm"
                  onClick={() => setReps(repsCount)}
                  className="text-xs"
                >
                  {repsCount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RPE Slider */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-base font-semibold mb-3 block">
              RPE (Rate of Perceived Exertion): {rpe[0]}
            </Label>
            <Slider
              value={rpe}
              onValueChange={setRpe}
              max={10}
              min={1}
              step={0.5}
              className="mb-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Very Easy</span>
              <span>5 - Moderate</span>
              <span>10 - Maximum</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={moveToPreviousSet}
            disabled={activeWorkout.currentExerciseIndex === 0 && activeWorkout.currentSetIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleCompleteSet}
            disabled={!weight || !reps}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-2" />
            Complete Set
          </Button>
          
          <Button
            variant="outline"
            onClick={moveToNextSet}
            disabled={isLastSet && isLastExercise}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            onClick={activeWorkout.isActive ? pauseWorkout : resumeWorkout}
            size="sm"
          >
            {activeWorkout.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="destructive"
            onClick={endWorkout}
            size="sm"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            End Workout
          </Button>
        </div>
      </div>
    </div>
  );
};