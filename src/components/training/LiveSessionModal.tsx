
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, Pause, Square, Clock, CheckCircle, Edit3 } from 'lucide-react';
import { useUpdateSession } from '@/hooks/useSessions';
import { useToast } from '@/hooks/use-toast';

interface LiveSessionModalProps {
  session: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LiveSessionModal: React.FC<LiveSessionModalProps> = ({
  session,
  open,
  onOpenChange
}) => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [editingExercise, setEditingExercise] = useState<number | null>(null);
  
  const updateSession = useUpdateSession();
  const { toast } = useToast();

  // Initialize exercise data when session loads
  useEffect(() => {
    if (session?.exercises) {
      setExerciseData(session.exercises.map((ex: any) => ({
        ...ex,
        actualSets: ex.sets,
        actualReps: ex.reps,
        actualLoad: ex.load_percent || 0,
        actualRpe: ex.rpe_target || 0
      })));
    }
  }, [session]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setIsActive(true);
    setStartTime(new Date());
    toast({
      title: "Session Started",
      description: "Your workout session is now active"
    });
  };

  const handlePauseSession = () => {
    setIsActive(false);
  };

  const handleCompleteSession = async () => {
    if (!session) return;

    try {
      await updateSession.mutateAsync({
        id: session.id,
        status: 'completed',
        end_ts: new Date().toISOString(),
        exercises: exerciseData
      });

      toast({
        title: "Session Completed",
        description: "Great work! Your session has been saved."
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete session",
        variant: "destructive"
      });
    }
  };

  const toggleExerciseComplete = (index: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);
  };

  const updateExerciseData = (index: number, field: string, value: any) => {
    setExerciseData(prev => prev.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    ));
  };

  if (!session) return null;

  const completedCount = completedExercises.size;
  const totalExercises = exerciseData.length;
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-md border border-white/10 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-400" />
              Live Session
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
              {isActive && <Badge className="bg-green-500/20 text-green-300">LIVE</Badge>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Controls */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">Progress: {completedCount}/{totalExercises} exercises</p>
              <div className="w-48 h-2 bg-white/10 rounded-full mt-2">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isActive && !startTime && (
                <Button onClick={handleStartSession} className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              )}
              {isActive && (
                <Button onClick={handlePauseSession} variant="outline" className="bg-yellow-600/20 border-yellow-500/30 text-yellow-300">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button 
                onClick={handleCompleteSession}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={completedCount === 0}
              >
                <Square className="w-4 h-4 mr-2" />
                Complete
              </Button>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            {exerciseData.map((exercise, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  completedExercises.has(index)
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={completedExercises.has(index)}
                      onCheckedChange={() => toggleExerciseComplete(index)}
                    />
                    <div>
                      <h4 className="text-white font-medium">{exercise.name}</h4>
                      {completedExercises.has(index) && (
                        <p className="text-green-300 text-sm flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingExercise(editingExercise === index ? null : index)}
                    className="text-white/60 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-white/60 text-sm">Sets</label>
                    {editingExercise === index ? (
                      <Input
                        type="number"
                        value={exercise.actualSets}
                        onChange={(e) => updateExerciseData(index, 'actualSets', parseInt(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">
                        {exercise.actualSets} <span className="text-white/50">/ {exercise.sets}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-white/60 text-sm">Reps</label>
                    {editingExercise === index ? (
                      <Input
                        type="number"
                        value={exercise.actualReps}
                        onChange={(e) => updateExerciseData(index, 'actualReps', parseInt(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">
                        {exercise.actualReps} <span className="text-white/50">/ {exercise.reps}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-white/60 text-sm">Load %</label>
                    {editingExercise === index ? (
                      <Input
                        type="number"
                        value={exercise.actualLoad}
                        onChange={(e) => updateExerciseData(index, 'actualLoad', parseInt(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">
                        {exercise.actualLoad}% <span className="text-white/50">/ {exercise.load_percent || 0}%</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-white/60 text-sm">RPE</label>
                    {editingExercise === index ? (
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={exercise.actualRpe}
                        onChange={(e) => updateExerciseData(index, 'actualRpe', parseInt(e.target.value))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">
                        {exercise.actualRpe} <span className="text-white/50">/ {exercise.rpe_target || 0}</span>
                      </p>
                    )}
                  </div>
                </div>

                {exercise.rest_seconds && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-white/60 text-sm">
                      Rest: {Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
