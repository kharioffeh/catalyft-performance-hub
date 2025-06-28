
import React, { useState } from 'react';
import { useTemplates, useCreateTemplate, useTemplateBlocks, useUpdateTemplateBlock } from '@/hooks/useTemplates';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Template, TemplateBlock, TemplateExercise } from '@/types/training';

interface NewTemplateBuilderProps {
  templateId?: string;
  onSave?: (template: Template) => void;
}

export const NewTemplateBuilder: React.FC<NewTemplateBuilderProps> = ({ templateId, onSave }) => {
  const [templateData, setTemplateData] = useState({
    title: '',
    goal: 'strength' as Template['goal'],
    weeks: 4,
    visibility: 'private' as Template['visibility'],
  });

  const { data: exercises } = useExerciseLibrary();
  const { data: templateBlocks } = useTemplateBlocks(templateId || '');
  const createTemplate = useCreateTemplate();
  const updateTemplateBlock = useUpdateTemplateBlock();

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  const handleCreateTemplate = async () => {
    if (!templateData.title) return;

    try {
      const template = await createTemplate.mutateAsync(templateData);
      onSave?.(template);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const getCurrentBlock = (): TemplateBlock | undefined => {
    return templateBlocks?.find(
      block => block.week_no === selectedWeek && block.day_no === selectedDay
    );
  };

  const handleAddExercise = (exerciseId: string) => {
    if (!templateId) return;

    const currentBlock = getCurrentBlock();
    const newExercise: TemplateExercise = {
      exercise_id: exerciseId,
      sets: 3,
      reps: 10,
      load_percent: 70,
      rest_seconds: 60,
    };

    const updatedBlock: TemplateBlock = {
      template_id: templateId,
      week_no: selectedWeek,
      day_no: selectedDay,
      session_title: currentBlock?.session_title || `Week ${selectedWeek} Day ${selectedDay}`,
      exercises: [...(currentBlock?.exercises || []), newExercise],
    };

    updateTemplateBlock.mutate(updatedBlock);
  };

  const handleUpdateExercise = (exerciseIndex: number, updates: Partial<TemplateExercise>) => {
    if (!templateId) return;

    const currentBlock = getCurrentBlock();
    if (!currentBlock) return;

    const updatedExercises = [...currentBlock.exercises];
    updatedExercises[exerciseIndex] = { ...updatedExercises[exerciseIndex], ...updates };

    const updatedBlock: TemplateBlock = {
      ...currentBlock,
      exercises: updatedExercises,
    };

    updateTemplateBlock.mutate(updatedBlock);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (!templateId) return;

    const currentBlock = getCurrentBlock();
    if (!currentBlock) return;

    const updatedExercises = currentBlock.exercises.filter((_, index) => index !== exerciseIndex);

    const updatedBlock: TemplateBlock = {
      ...currentBlock,
      exercises: updatedExercises,
    };

    updateTemplateBlock.mutate(updatedBlock);
  };

  const currentBlock = getCurrentBlock();
  const exerciseOptions = exercises || [];

  return (
    <div className="space-y-6">
      {/* Template Header */}
      {!templateId && (
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-white">Template Title</Label>
              <Input
                id="title"
                value={templateData.title}
                onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                placeholder="e.g., Strength Building Program"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="goal" className="text-white">Goal</Label>
              <Select value={templateData.goal} onValueChange={(value) => setTemplateData({ ...templateData, goal: value as Template['goal'] })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="power">Power</SelectItem>
                  <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="rehab">Rehabilitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weeks" className="text-white">Duration (weeks)</Label>
              <Input
                id="weeks"
                type="number"
                min="1"
                max="12"
                value={templateData.weeks}
                onChange={(e) => setTemplateData({ ...templateData, weeks: parseInt(e.target.value) })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="visibility" className="text-white">Visibility</Label>
              <Select value={templateData.visibility} onValueChange={(value) => setTemplateData({ ...templateData, visibility: value as Template['visibility'] })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="org">Organization</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleCreateTemplate} disabled={!templateData.title || createTemplate.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {createTemplate.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Template Builder */}
      {templateId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week/Day Navigator */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Week & Day</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-white">Week</Label>
                <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Day</Label>
                <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>Day {day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* Exercise Library */}
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Exercise Library</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {exerciseOptions.map((exercise) => (
                <div key={exercise.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div>
                    <p className="text-white font-medium">{exercise.name}</p>
                    <p className="text-white/60 text-sm">{exercise.category} • {exercise.primary_muscle}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddExercise(exercise.id)}
                    className="text-white hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Session Builder */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Week {selectedWeek}, Day {selectedDay}
              </h3>
              <Badge variant="outline" className="text-white border-white/20">
                {currentBlock?.exercises.length || 0} exercises
              </Badge>
            </div>

            <div className="space-y-3">
              {currentBlock?.exercises.map((exercise, index) => {
                const exerciseInfo = exerciseOptions.find(e => e.id === exercise.exercise_id);
                return (
                  <div key={index} className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{exerciseInfo?.name}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveExercise(index)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-white/70 text-xs">Sets</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => handleUpdateExercise(index, { sets: parseInt(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs">Reps</Label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => handleUpdateExercise(index, { reps: parseInt(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs">Load %</Label>
                        <Input
                          type="number"
                          value={exercise.load_percent || ''}
                          onChange={(e) => handleUpdateExercise(index, { load_percent: parseInt(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs">Rest (s)</Label>
                        <Input
                          type="number"
                          value={exercise.rest_seconds || ''}
                          onChange={(e) => handleUpdateExercise(index, { rest_seconds: parseInt(e.target.value) })}
                          className="bg-white/10 border-white/20 text-white h-8"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {(!currentBlock || currentBlock.exercises.length === 0) && (
              <div className="text-center py-8">
                <p className="text-white/60">No exercises added yet</p>
                <p className="text-white/40 text-sm">Select exercises from the library to get started</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};
