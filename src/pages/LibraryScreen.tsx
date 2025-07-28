import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExerciseCard } from '@/components/ExerciseCard';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { Search, Library, Play, Info, Target, Zap, Clock, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exercise } from '@/types/exercise';

const LibraryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { exercises, loading, error } = useExerciseSearch({
    searchTerm: searchQuery,
    muscles: selectedMuscles,
    equipment: selectedEquipment,
    difficulty: selectedDifficulty,
  });

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedExercise(null);
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

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getIntensityIcon = (zone?: string) => {
    switch (zone) {
      case 'power': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'hypertrophy': return <Trophy className="w-4 h-4 text-blue-400" />;
      case 'endurance': return <Clock className="w-4 h-4 text-green-400" />;
      case 'strength': return <Target className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getMuscleColor = (muscle: string) => {
    const colors = {
      chest: 'bg-blue-500/20 text-blue-400',
      back: 'bg-purple-500/20 text-purple-400',
      shoulders: 'bg-orange-500/20 text-orange-400',
      biceps: 'bg-cyan-500/20 text-cyan-400',
      triceps: 'bg-pink-500/20 text-pink-400',
      quadriceps: 'bg-green-500/20 text-green-400',
      hamstrings: 'bg-yellow-500/20 text-yellow-400',
      glutes: 'bg-red-500/20 text-red-400',
      calves: 'bg-indigo-500/20 text-indigo-400',
      core: 'bg-teal-500/20 text-teal-400',
      traps: 'bg-amber-500/20 text-amber-400',
      forearms: 'bg-lime-500/20 text-lime-400',
      default: 'bg-gray-500/20 text-gray-400'
    };
    return colors[muscle as keyof typeof colors] || colors.default;
  };

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Library className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Exercise Library</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search exercises by name, muscle, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
            </div>
          )}
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

      {/* Exercise Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-left">
                  {selectedExercise?.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  {selectedExercise?.difficulty && (
                    <Badge className={cn("text-xs border", getDifficultyColor(selectedExercise.difficulty))}>
                      {selectedExercise.difficulty}
                    </Badge>
                  )}
                  {selectedExercise?.intensity_zone && (
                    <Badge variant="outline" className="text-xs capitalize">
                      <div className="flex items-center gap-1">
                        {getIntensityIcon(selectedExercise.intensity_zone)}
                        {selectedExercise.intensity_zone}
                      </div>
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedExercise && (
            <div className="space-y-6">
              {/* Video/Thumbnail */}
              {selectedExercise.video_url ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    src={selectedExercise.video_url} 
                    controls 
                    className="w-full h-full"
                    poster={selectedExercise.thumbnail_url}
                  />
                </div>
              ) : selectedExercise.thumbnail_url ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={selectedExercise.thumbnail_url} 
                    alt={selectedExercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No video available</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedExercise.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedExercise.description}</p>
                </div>
              )}

              {/* Muscle Groups */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Target Muscles</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedExercise.muscle || []).map((muscle, index) => (
                    <Badge 
                      key={index}
                      className={cn("border-0 capitalize", getMuscleColor(muscle))}
                    >
                      {muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedExercise.equipment || []).map((equipment, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {equipment.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Movement Pattern */}
              {selectedExercise.pattern && selectedExercise.pattern.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Movement Pattern</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.pattern.map((pattern, index) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {pattern.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedExercise.modality && selectedExercise.modality.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Modality</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.modality.map((mod, index) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {mod.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedExercise.plane && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Movement Plane</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedExercise.plane.replace('_', ' ')}
                    </Badge>
                  </div>
                )}

                {selectedExercise.energy_system && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Energy System</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedExercise.energy_system.replace('_', ' ')}
                    </Badge>
                  </div>
                )}

                {selectedExercise.sport && selectedExercise.sport.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Sport Application</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.sport.map((sport, index) => (
                        <Badge key={index} variant="outline" className="text-xs capitalize">
                          {sport.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryScreen;