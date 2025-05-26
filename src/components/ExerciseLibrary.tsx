
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useExercises } from '@/hooks/useExercises';
import { Exercise } from '@/types/workout';

interface ExerciseLibraryProps {
  onExerciseSelect?: (exercise: Exercise) => void;
  showAddButton?: boolean;
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onExerciseSelect,
  showAddButton = false,
}) => {
  const { data: exercises = [], isLoading } = useExercises();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(exercises.map(e => e.category)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category} className="capitalize">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card 
            key={exercise.id}
            className={onExerciseSelect ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
            onClick={() => onExerciseSelect?.(exercise)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {exercise.instructions?.substring(0, 100)}...
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">
                  {exercise.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Muscle Groups:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
                      <Badge key={index} variant="secondary" className="capitalize text-xs">
                        {muscle.replace('_', ' ')}
                      </Badge>
                    ))}
                    {exercise.muscle_groups.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{exercise.muscle_groups.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {exercise.equipment.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Equipment:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.equipment.slice(0, 2).map((eq, index) => (
                        <Badge key={index} variant="outline" className="capitalize text-xs">
                          {eq.replace('_', ' ')}
                        </Badge>
                      ))}
                      {exercise.equipment.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{exercise.equipment.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {showAddButton && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onExerciseSelect?.(exercise);
                    }}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Template
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No exercises found matching your criteria
        </div>
      )}
    </div>
  );
};
