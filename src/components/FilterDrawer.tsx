
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Filter } from 'lucide-react';
import { ExerciseFilters } from '@/types/exercise';

interface FilterDrawerProps {
  filters: ExerciseFilters;
  onFiltersChange: (filters: ExerciseFilters) => void;
}

const filterOptions = {
  pattern: ['squat', 'push', 'pull', 'hinge', 'lunge', 'carry', 'jump'],
  muscle: ['quadriceps', 'glutes', 'hamstrings', 'chest', 'back', 'shoulders', 'triceps', 'biceps', 'core'],
  equipment: ['barbell', 'dumbbell', 'kettlebell', 'bodyweight', 'resistance_band', 'pull_up_bar', 'cable'],
  modality: ['strength', 'conditioning', 'plyometric', 'flexibility', 'balance'],
  sport: ['rugby', 'football', 'basketball', 'tennis', 'golf', 'running'],
  intensity_zone: ['power', 'hypertrophy', 'endurance'],
  difficulty: ['beginner', 'intermediate', 'advanced', 'elite']
};

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ filters, onFiltersChange }) => {
  const handleArrayFilterChange = (category: keyof ExerciseFilters, value: string, checked: boolean) => {
    const currentArray = (filters[category] as string[]) || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [category]: newArray.length > 0 ? newArray : undefined
    });
  };

  const handleSingleFilterChange = (category: keyof ExerciseFilters, value: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [category]: checked ? value : undefined
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Exercise Filters</SheetTitle>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Pattern Filters */}
          <div>
            <Label className="text-sm font-medium">Movement Pattern</Label>
            <div className="space-y-2 mt-2">
              {filterOptions.pattern.map((pattern) => (
                <div key={pattern} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pattern-${pattern}`}
                    checked={(filters.pattern || []).includes(pattern)}
                    onCheckedChange={(checked) => 
                      handleArrayFilterChange('pattern', pattern, checked as boolean)
                    }
                  />
                  <Label htmlFor={`pattern-${pattern}`} className="text-sm capitalize">
                    {pattern}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Muscle Filters */}
          <div>
            <Label className="text-sm font-medium">Muscle Groups</Label>
            <div className="space-y-2 mt-2">
              {filterOptions.muscle.map((muscle) => (
                <div key={muscle} className="flex items-center space-x-2">
                  <Checkbox
                    id={`muscle-${muscle}`}
                    checked={(filters.muscle || []).includes(muscle)}
                    onCheckedChange={(checked) => 
                      handleArrayFilterChange('muscle', muscle, checked as boolean)
                    }
                  />
                  <Label htmlFor={`muscle-${muscle}`} className="text-sm capitalize">
                    {muscle}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Equipment Filters */}
          <div>
            <Label className="text-sm font-medium">Equipment</Label>
            <div className="space-y-2 mt-2">
              {filterOptions.equipment.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`equipment-${equipment}`}
                    checked={(filters.equipment || []).includes(equipment)}
                    onCheckedChange={(checked) => 
                      handleArrayFilterChange('equipment', equipment, checked as boolean)
                    }
                  />
                  <Label htmlFor={`equipment-${equipment}`} className="text-sm capitalize">
                    {equipment.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Difficulty Filter */}
          <div>
            <Label className="text-sm font-medium">Difficulty</Label>
            <div className="space-y-2 mt-2">
              {filterOptions.difficulty.map((difficulty) => (
                <div key={difficulty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`difficulty-${difficulty}`}
                    checked={filters.difficulty === difficulty}
                    onCheckedChange={(checked) => 
                      handleSingleFilterChange('difficulty', difficulty, checked as boolean)
                    }
                  />
                  <Label htmlFor={`difficulty-${difficulty}`} className="text-sm capitalize">
                    {difficulty}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
