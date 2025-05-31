
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExerciseCard } from '@/components/ExerciseCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ExerciseModal } from '@/components/ExerciseModal';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { Exercise, ExerciseFilters } from '@/types/exercise';
import { Search, Library } from 'lucide-react';
import { useDebounce } from '@/hooks/use-mobile';

const LibraryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { data: exercises = [], isLoading, error } = useExerciseSearch(debouncedSearchQuery, filters);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    ).length;
  }, [filters]);

  return (
    <div className="space-y-6">
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
              <FilterDrawer filters={filters} onFiltersChange={setFilters} />
              {activeFilterCount > 0 && (
                <span className="text-sm text-gray-500">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
          </div>
        </CardHeader>
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
          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-md mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading exercises: {error.message}
            </div>
          ) : exercises.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onClick={handleExerciseClick}
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

      {/* Exercise Modal */}
      <ExerciseModal
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default LibraryPage;
