
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from '@/components/ExerciseCard';
import { FilterDrawer } from '@/components/FilterDrawer';
import { ExerciseModal } from '@/components/ExerciseModal';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { Exercise, ExerciseFilters } from '@/types/exercise';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export const ExerciseLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { data: exercises = [], isLoading } = useExerciseSearch(debouncedSearchQuery, filters);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
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
        <FilterDrawer filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-md mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
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
          No exercises found
        </div>
      )}

      {/* Exercise Modal */}
      <ExerciseModal
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};
