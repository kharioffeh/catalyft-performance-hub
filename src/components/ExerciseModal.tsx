
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/types/exercise';
import { X, Plus } from 'lucide-react';

interface ExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onInsertExercise?: (exerciseId: string) => void;
  showInsertButton?: boolean;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({ 
  exercise, 
  isOpen, 
  onClose, 
  onInsertExercise,
  showInsertButton = false 
}) => {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{exercise.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          {exercise.video_url && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                src={exercise.video_url}
                className="w-full h-full"
                controls
                autoPlay
                muted
                loop
              />
            </div>
          )}

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-600">{exercise.description}</p>
            </div>
          )}

          {/* Exercise Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movement Patterns */}
            {exercise.pattern.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Movement Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.pattern.map((pattern) => (
                    <Badge key={pattern} variant="outline" className="capitalize">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Muscle Groups */}
            {exercise.muscle.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Muscle Groups</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.muscle.map((muscle) => (
                    <Badge key={muscle} variant="outline" className="capitalize">
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {exercise.equipment.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipment.map((equipment) => (
                    <Badge key={equipment} variant="outline" className="capitalize">
                      {equipment.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Modality */}
            {exercise.modality.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Training Modality</h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.modality.map((modality) => (
                    <Badge key={modality} variant="outline" className="capitalize">
                      {modality}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Properties */}
            <div className="space-y-2">
              {exercise.difficulty && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Difficulty:</span>
                  <Badge variant="secondary" className="capitalize">
                    {exercise.difficulty}
                  </Badge>
                </div>
              )}
              
              {exercise.intensity_zone && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Intensity Zone:</span>
                  <Badge variant="secondary" className="capitalize">
                    {exercise.intensity_zone}
                  </Badge>
                </div>
              )}
              
              {exercise.energy_system && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Energy System:</span>
                  <Badge variant="secondary" className="capitalize">
                    {exercise.energy_system}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Insert Button for Program Builder */}
          {showInsertButton && onInsertExercise && (
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => onInsertExercise(exercise.id)}>
                <Plus className="w-4 h-4 mr-2" />
                Insert into Program
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
