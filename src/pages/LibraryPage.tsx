
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { Search, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);

  const { exercises, loading, error } = useExerciseSearch({
    searchTerm: searchQuery,
    muscles: selectedMuscles,
    equipment: selectedEquipment,
    difficulty: selectedDifficulty,
  });

  const handleExerciseClick = (exercise: any) => {
    console.log('Exercise clicked:', exercise);
  };

  const muscleOptions = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'traps'
  ];

  const equipmentOptions = [
    'bodyweight', 'dumbbell', 'barbell', 'cable', 'machine', 'resistance_band',
    'kettlebell', 'medicine_ball', 'pull_up_bar', 'battle_ropes'
  ];

  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];

  const handleMuscleToggle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearAllFilters = () => {
    setSelectedMuscles([]);
    setSelectedEquipment([]);
    setSelectedDifficulty([]);
  };

  const activeFilterCount = selectedMuscles.length + selectedEquipment.length + selectedDifficulty.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Library className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="text-sm text-gray-500">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Muscle Groups */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Muscle Groups</h3>
            <div className="flex flex-wrap gap-2">
              {muscleOptions.map(muscle => (
                <Badge
                  key={muscle}
                  variant={selectedMuscles.includes(muscle) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleMuscleToggle(muscle)}
                >
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Equipment</h3>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(equipment => (
                <Badge
                  key={equipment}
                  variant={selectedEquipment.includes(equipment) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleEquipmentToggle(equipment)}
                >
                  {equipment.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map(difficulty => (
                <Badge
                  key={difficulty}
                  variant={selectedDifficulty.includes(difficulty) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => handleDifficultyToggle(difficulty)}
                >
                  {difficulty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            {exercises.length > 0 
              ? `${exercises.length} Exercise${exercises.length > 1 ? 's' : ''} Found`
              : 'Exercises'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading exercises: {error}
            </div>
          ) : exercises.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onClick={handleExerciseClick}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || activeFilterCount > 0 
                ? 'No exercises found matching your criteria'
                : 'No exercises available'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LibraryPage;
