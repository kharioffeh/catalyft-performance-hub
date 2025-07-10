
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Star, Zap, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exercise } from '@/types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: (exercise: Exercise) => void;
  isSelected?: boolean;
  viewMode?: 'grid' | 'list';
  showDescription?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = memo(({
  exercise,
  onClick,
  isSelected = false,
  viewMode = 'grid',
  showDescription = true
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getIntensityIcon = (zone?: string) => {
    switch (zone) {
      case 'power': return <Zap className="w-3 h-3" />;
      case 'hypertrophy': return <TrendingUp className="w-3 h-3" />;
      case 'endurance': return <Target className="w-3 h-3" />;
      default: return null;
    }
  };

  const getMuscleColor = (muscle: string) => {
    const colors = {
      chest: 'bg-blue-500/20 text-blue-400',
      back: 'bg-purple-500/20 text-purple-400',
      shoulders: 'bg-orange-500/20 text-orange-400',
      biceps: 'bg-cyan-500/20 text-cyan-400',
      triceps: 'bg-pink-500/20 text-pink-400',
      quadriceps: 'bg-green-500/20 text-green-400',
      hamstrings: 'bg-yellow-500/20 text-yellow-400',
      glutes: 'bg-red-500/20 text-red-400',
      calves: 'bg-indigo-500/20 text-indigo-400',
      core: 'bg-teal-500/20 text-teal-400',
      traps: 'bg-amber-500/20 text-amber-400',
      forearms: 'bg-lime-500/20 text-lime-400',
      default: 'bg-gray-500/20 text-gray-400'
    };
    return colors[muscle as keyof typeof colors] || colors.default;
  };

  const renderThumbnail = () => {
    if (exercise.thumbnail_url) {
      return (
        <img
          src={exercise.thumbnail_url}
          alt={exercise.name}
          className="w-full h-full object-cover"
        />
      );
    }
    
    // Fallback placeholder with exercise initial
    return (
      <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
        <div className="text-2xl font-bold text-white/60">
          {exercise.name.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:scale-[1.02] border",
          isSelected 
            ? "bg-white/20 border-white/30 shadow-lg" 
            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
        )}
        onClick={() => onClick?.(exercise)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
              {renderThumbnail()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white text-lg leading-tight">
                  {exercise.name}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={cn("text-xs border", getDifficultyColor(exercise.difficulty))}>
                    {exercise.difficulty}
                  </Badge>
                  {exercise.video_url && (
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-red-400 fill-current" />
                    </div>
                  )}
                </div>
              </div>

              {/* Muscle Groups */}
              <div className="flex flex-wrap gap-1 mb-2">
                {(exercise.muscle || []).slice(0, 3).map((muscle, index) => (
                  <Badge 
                    key={index}
                    className={cn("text-xs border-0", getMuscleColor(muscle))}
                  >
                    {muscle}
                  </Badge>
                ))}
                {(exercise.muscle || []).length > 3 && (
                  <Badge className="text-xs bg-gray-500/20 text-gray-400">
                    +{(exercise.muscle || []).length - 3} more
                  </Badge>
                )}
              </div>

              {/* Equipment & Intensity */}
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="capitalize">
                  {(exercise.equipment || [])[0]?.replace('_', ' ')}
                </span>
                {exercise.intensity_zone && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {getIntensityIcon(exercise.intensity_zone)}
                      <span className="capitalize">{exercise.intensity_zone}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              {showDescription && exercise.description && (
                <p className="text-sm text-white/60 mt-2 line-clamp-2">
                  {exercise.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:scale-[1.02] border h-full",
        isSelected 
          ? "bg-white/20 border-white/30 shadow-lg" 
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
      )}
      onClick={() => onClick?.(exercise)}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative w-full h-40 bg-white/5 rounded-t-lg overflow-hidden">
          {renderThumbnail()}
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <Badge className={cn("text-xs border", getDifficultyColor(exercise.difficulty))}>
              {exercise.difficulty}
            </Badge>
          </div>
          
          {exercise.video_url && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <Play className="w-3 h-3 text-red-400 fill-current" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-white text-lg mb-2 leading-tight">
            {exercise.name}
          </h3>

          {/* Muscle Groups */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(exercise.muscle || []).slice(0, 2).map((muscle, index) => (
              <Badge 
                key={index}
                className={cn("text-xs border-0", getMuscleColor(muscle))}
              >
                {muscle}
              </Badge>
            ))}
            {(exercise.muscle || []).length > 2 && (
              <Badge className="text-xs bg-gray-500/20 text-gray-400">
                +{(exercise.muscle || []).length - 2}
              </Badge>
            )}
          </div>

          {/* Equipment & Intensity */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
            <span className="capitalize">
              {(exercise.equipment || [])[0]?.replace('_', ' ')}
            </span>
            {exercise.intensity_zone && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {getIntensityIcon(exercise.intensity_zone)}
                  <span className="capitalize">{exercise.intensity_zone}</span>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          {showDescription && exercise.description && (
            <p className="text-sm text-white/60 line-clamp-3 flex-1">
              {exercise.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
