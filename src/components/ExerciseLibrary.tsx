
import React, { useState, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Grid, List, Loader2 } from 'lucide-react';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { ExerciseCard } from './ExerciseCard';
import { cn } from '@/lib/utils';

interface ExerciseLibraryProps {
  onExerciseSelect?: (exercise: any) => void;
  selectedExercises?: string[];
  multiSelect?: boolean;
  className?: string;
}

const ITEMS_PER_PAGE = 40;

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onExerciseSelect,
  selectedExercises = [],
  multiSelect = false,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { exercises, loading, error } = useExerciseSearch({
    searchTerm,
    muscles: selectedMuscles,
    equipment: selectedEquipment,
    difficulty: selectedDifficulty,
  });

  // Pagination
  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return exercises.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [exercises, currentPage]);

  const totalPages = Math.ceil(exercises.length / ITEMS_PER_PAGE);

  // Available filter options
  const muscleOptions = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'traps'
  ];

  const equipmentOptions = [
    'bodyweight', 'dumbbell', 'barbell', 'cable', 'machine', 'resistance_band',
    'kettlebell', 'medicine_ball', 'pull_up_bar', 'battle_ropes'
  ];

  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleMuscleToggle = useCallback((muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
    setCurrentPage(1);
  }, []);

  const handleEquipmentToggle = useCallback((equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
    setCurrentPage(1);
  }, []);

  const handleDifficultyToggle = useCallback((difficulty: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedMuscles([]);
    setSelectedEquipment([]);
    setSelectedDifficulty([]);
    setCurrentPage(1);
  }, []);

  const handleExerciseClick = useCallback((exercise: any) => {
    if (onExerciseSelect) {
      onExerciseSelect(exercise);
    }
  }, [onExerciseSelect]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMuscleColor = (muscle: string) => {
    const colors = {
      chest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      back: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      shoulders: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      biceps: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      triceps: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      legs: 'bg-green-500/20 text-green-400 border-green-500/30',
      core: 'bg-red-500/20 text-red-400 border-red-500/30',
      default: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[muscle as keyof typeof colors] || colors.default;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>Error loading exercises: {error}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-4 space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Exercise Library</h2>
          <p className="text-white/60 text-sm">
            {exercises.length} exercises • Page {currentPage} of {totalPages}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            {/* Muscle Groups */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Muscle Groups</h3>
              <div className="flex flex-wrap gap-2">
                {muscleOptions.map(muscle => (
                  <Badge
                    key={muscle}
                    variant={selectedMuscles.includes(muscle) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer capitalize border transition-all duration-200",
                      selectedMuscles.includes(muscle) 
                        ? getMuscleColor(muscle)
                        : "border-white/20 text-white/60 hover:bg-white/10"
                    )}
                    onClick={() => handleMuscleToggle(muscle)}
                  >
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map(equipment => (
                  <Badge
                    key={equipment}
                    variant={selectedEquipment.includes(equipment) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer capitalize border transition-all duration-200",
                      selectedEquipment.includes(equipment)
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "border-white/20 text-white/60 hover:bg-white/10"
                    )}
                    onClick={() => handleEquipmentToggle(equipment)}
                  >
                    {equipment.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map(difficulty => (
                  <Badge
                    key={difficulty}
                    variant={selectedDifficulty.includes(difficulty) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer capitalize border transition-all duration-200",
                      selectedDifficulty.includes(difficulty)
                        ? getDifficultyColor(difficulty)
                        : "border-white/20 text-white/60 hover:bg-white/10"
                    )}
                    onClick={() => handleDifficultyToggle(difficulty)}
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedMuscles.length > 0 || selectedEquipment.length > 0 || selectedDifficulty.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        </div>
      )}

      {/* Exercise Grid/List */}
      {!loading && (
        <>
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {paginatedExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => handleExerciseClick(exercise)}
                isSelected={selectedExercises.includes(exercise.id)}
                viewMode={viewMode}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 p-0",
                        currentPage === pageNum
                          ? "bg-white/20 text-white border-white/30"
                          : "border-white/20 text-white hover:bg-white/10"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-white/60">
          <Search className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No exercises found</h3>
          <p className="text-sm text-center max-w-md">
            Try adjusting your search terms or filters to find exercises.
          </p>
        </div>
      )}
    </div>
  );
};
