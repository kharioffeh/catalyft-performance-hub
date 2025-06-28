
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTemplateGrid } from '@/hooks/useTemplateGrid';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { Dumbbell } from 'lucide-react';

interface TemplateGridViewProps {
  templateId: string;
}

export const TemplateGridView: React.FC<TemplateGridViewProps> = ({ templateId }) => {
  const { data: gridData = [], isLoading } = useTemplateGrid(templateId);
  const { data: exercises = [] } = useExerciseLibrary();

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  // Group by week and day
  const groupedData = gridData.reduce((acc, item) => {
    const weekKey = `week-${item.week_no}`;
    const dayKey = `day-${item.day_no}`;
    
    if (!acc[weekKey]) acc[weekKey] = {};
    if (!acc[weekKey][dayKey]) acc[weekKey][dayKey] = [];
    
    acc[weekKey][dayKey].push(item);
    return acc;
  }, {} as Record<string, Record<string, typeof gridData>>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (gridData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No exercises found in this template</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedData).map(([weekKey, weekData]) => {
        const weekNumber = parseInt(weekKey.split('-')[1]);
        
        return (
          <Card key={weekKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">Week {weekNumber}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {Object.entries(weekData).map(([dayKey, dayExercises]) => {
                  const dayNumber = parseInt(dayKey.split('-')[1]);
                  
                  return (
                    <div key={dayKey} className="space-y-2">
                      <div className="font-medium text-sm text-gray-600">
                        Day {dayNumber}
                      </div>
                      <div className="space-y-2">
                        {dayExercises.map((exercise, index) => (
                          <div
                            key={`${exercise.exercise_id}-${index}`}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="font-medium text-sm mb-1">
                              {getExerciseName(exercise.exercise_id)}
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>{exercise.sets} sets × {exercise.reps} reps</div>
                              {exercise.load_pct && (
                                <div className="text-blue-600 font-medium">
                                  {exercise.load_pct}% load
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
