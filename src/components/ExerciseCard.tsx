
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Exercise } from '@/types/exercise';
import { Play } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow group"
      onClick={() => onClick(exercise)}
    >
      <CardContent className="p-3">
        <div className="aspect-video bg-gray-100 rounded-md mb-3 relative overflow-hidden">
          {exercise.thumbnail_url ? (
            <img 
              src={exercise.thumbnail_url} 
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : exercise.video_url ? (
            <video 
              src={exercise.video_url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              muted
              loop
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-sm mb-2 line-clamp-2">{exercise.name}</h3>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              exercise.origin === 'SYSTEM' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {exercise.origin}
          </Badge>
          
          {exercise.difficulty && (
            <span className="text-xs text-gray-500 capitalize">{exercise.difficulty}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
