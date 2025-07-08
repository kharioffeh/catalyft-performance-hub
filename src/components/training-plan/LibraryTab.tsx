
import React, { useState } from 'react';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibraryTabProps {
  onAddExercise?: (exercise: any) => void;
  selectedExercises?: string[];
}

export const LibraryTab: React.FC<LibraryTabProps> = ({ 
  onAddExercise,
  selectedExercises = []
}) => {
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<any>(null);

  const handleExerciseSelect = (exercise: any) => {
    setSelectedExerciseDetail(exercise);
  };

  const handleAddExercise = () => {
    if (selectedExerciseDetail && onAddExercise) {
      onAddExercise(selectedExerciseDetail);
      setSelectedExerciseDetail(null);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Exercise Library - Takes most of the space */}
      <div className="flex-1 min-w-0">
        <ExerciseLibrary
          onExerciseSelect={handleExerciseSelect}
          selectedExercises={selectedExercises}
          className="h-full"
        />
      </div>

      {/* Exercise Detail Panel - Fixed width sidebar */}
      <div className="w-80 flex-shrink-0">
        {selectedExerciseDetail ? (
          <Card className="bg-white/5 border-white/10 h-fit sticky top-4">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl text-white mb-2">
                    {selectedExerciseDetail.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedExerciseDetail.muscle.map((muscle: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExerciseDetail(null)}
                  className="text-white/60 hover:text-white hover:bg-white/10 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Thumbnail */}
              {selectedExerciseDetail.thumbnail_url && (
                <div className="w-full h-48 bg-white/5 rounded-lg overflow-hidden">
                  <img
                    src={selectedExerciseDetail.thumbnail_url}
                    alt={selectedExerciseDetail.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-1">Equipment</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedExerciseDetail.equipment.map((eq: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/60">
                        {eq.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-1">Difficulty</h4>
                  <Badge className={cn(
                    "text-xs border",
                    selectedExerciseDetail.difficulty === 'beginner' && "bg-green-500/20 text-green-400 border-green-500/30",
                    selectedExerciseDetail.difficulty === 'intermediate' && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    selectedExerciseDetail.difficulty === 'advanced' && "bg-red-500/20 text-red-400 border-red-500/30"
                  )}>
                    {selectedExerciseDetail.difficulty}
                  </Badge>
                </div>

                {selectedExerciseDetail.intensity_zone && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-1">Intensity Zone</h4>
                    <Badge variant="outline" className="text-xs border-white/20 text-white/60 capitalize">
                      {selectedExerciseDetail.intensity_zone}
                    </Badge>
                  </div>
                )}

                {selectedExerciseDetail.description && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-1">Description</h4>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {selectedExerciseDetail.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                {onAddExercise && (
                  <Button
                    onClick={handleAddExercise}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Workout
                  </Button>
                )}
                {selectedExerciseDetail.video_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedExerciseDetail.video_url, '_blank')}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Watch
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 border-white/10 h-fit">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select an Exercise</h3>
              <p className="text-sm text-white/60 mb-4">
                Click on any exercise from the library to view details and add it to your workout.
              </p>
              <div className="flex items-center justify-center gap-1 text-xs text-white/40">
                <Sparkles className="w-3 h-3" />
                <span>200+ exercises available</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
