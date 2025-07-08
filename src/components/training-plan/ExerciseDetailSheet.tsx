import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Zap, Target, TrendingUp, Dumbbell, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exercise } from '@/types/exercise';

interface ExerciseDetailSheetProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWorkout?: (exercise: Exercise) => void;
}

export const ExerciseDetailSheet: React.FC<ExerciseDetailSheetProps> = ({
  exercise,
  isOpen,
  onClose,
  onAddToWorkout
}) => {
  if (!exercise) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getIntensityIcon = (zone: string) => {
    switch (zone) {
      case 'power': return <Zap className="w-4 h-4" />;
      case 'hypertrophy': return <TrendingUp className="w-4 h-4" />;
      case 'endurance': return <Target className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMuscleColor = (muscle: string) => {
    const colors = {
      chest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      back: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shoulders: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      biceps: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      triceps: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      quadriceps: 'bg-green-500/20 text-green-400 border-green-500/30',
      hamstrings: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      glutes: 'bg-red-500/20 text-red-400 border-red-500/30',
      calves: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      core: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      traps: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      forearms: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
      default: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[muscle as keyof typeof colors] || colors.default;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] bg-background border-border">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl text-foreground">
            {exercise.name}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Exercise details and instructions
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-20">
          {/* Video/GIF Section */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              {exercise.video_url ? (
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                  <video
                    src={exercise.video_url}
                    className="w-full h-full object-cover"
                    controls
                    poster={exercise.thumbnail_url}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="w-12 h-12 text-white opacity-80" />
                  </div>
                </div>
              ) : exercise.thumbnail_url ? (
                <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={exercise.thumbnail_url}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Dumbbell className="w-12 h-12 mx-auto mb-2" />
                    <p>No video or image available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Muscle Groups */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Target Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.muscle.map((muscle, index) => (
                  <Badge 
                    key={index}
                    className={cn("text-sm border capitalize", getMuscleColor(muscle))}
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exercise Details */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Exercise Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Difficulty</h4>
                  <Badge className={cn("text-sm border capitalize", getDifficultyColor(exercise.difficulty || ''))}>
                    {exercise.difficulty || 'Not specified'}
                  </Badge>
                </div>

                {exercise.intensity_zone && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Intensity Zone</h4>
                    <div className="flex items-center gap-2">
                      {getIntensityIcon(exercise.intensity_zone)}
                      <Badge variant="secondary" className="text-sm capitalize">
                        {exercise.intensity_zone}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipment.map((eq, index) => (
                    <Badge key={index} variant="outline" className="text-sm capitalize">
                      {eq.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {exercise.pattern && exercise.pattern.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Movement Pattern</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.pattern.map((pattern, index) => (
                      <Badge key={index} variant="outline" className="text-sm capitalize">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise Description/Cues */}
          {exercise.description && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Instructions & Cues</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {exercise.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {onAddToWorkout && (
              <Button
                onClick={() => onAddToWorkout(exercise)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Add to Workout
              </Button>
            )}
            {exercise.video_url && (
              <Button
                variant="outline"
                onClick={() => window.open(exercise.video_url, '_blank')}
                className="border-border text-foreground hover:bg-accent"
              >
                Watch Video
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};