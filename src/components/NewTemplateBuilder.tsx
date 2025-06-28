
import React, { useState } from 'react';
import { useTemplates, useCreateTemplate, useTemplateBlocks, useUpdateTemplateBlock } from '@/hooks/useTemplates';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { useUpsertExercise } from '@/hooks/useUpsertExercise';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Trash2, Grid } from 'lucide-react';
import { Template, TemplateBlock, TemplateExercise } from '@/types/training';
import { TemplateGridView } from '@/components/TemplateGridView';
import { CreateProgramFromTemplateDialog } from '@/components/CreateProgramFromTemplateDialog';

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

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showCreateProgramDialog, setShowCreateProgramDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: exercises } = useExerciseLibrary();
  const { data: templateBlocks } = useTemplateBlocks(templateId || '');
  const { data: template } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplateBlock = useUpdateTemplateBlock();
  const upsertExercise = useUpsertExercise();

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

  const handleCreateProgram = () => {
    if (templateId && template) {
      const currentTemplate = template.find(t => t.id === templateId);
      if (currentTemplate) {
        setSelectedTemplate(currentTemplate);
        setShowCreateProgramDialog(true);
      }
    }
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
              <Label htmlFor="title" className="text-gray-200 font-medium">Template Title</Label>
              <Input
                id="title"
                value={templateData.title}
                onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                placeholder="e.g., Strength Building Program"
                className="bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div>
              <Label htmlFor="goal" className="text-gray-200 font-medium">Goal</Label>
              <Select value={templateData.goal} onValueChange={(value) => setTemplateData({ ...templateData, goal: value as Template['goal'] })}>
                <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="strength" className="text-white hover:bg-gray-700">Strength</SelectItem>
                  <SelectItem value="power" className="text-white hover:bg-gray-700">Power</SelectItem>
                  <SelectItem value="hypertrophy" className="text-white hover:bg-gray-700">Hypertrophy</SelectItem>
                  <SelectItem value="endurance" className="text-white hover:bg-gray-700">Endurance</SelectItem>
                  <SelectItem value="rehab" className="text-white hover:bg-gray-700">Rehabilitation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weeks" className="text-gray-200 font-medium">Duration (weeks)</Label>
              <Input
                id="weeks"
                type="number"
                min="1"
                max="12"
                value={templateData.weeks}
                onChange={(e) => setTemplateData({ ...templateData, weeks: parseInt(e.target.value) })}
                className="bg-gray-800/80 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div>
              <Label htmlFor="visibility" className="text-gray-200 font-medium">Visibility</Label>
              <Select value={templateData.visibility} onValueChange={(value) => setTemplateData({ ...templateData, visibility: value as Template['visibility'] })}>
                <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="private" className="text-white hover:bg-gray-700">Private</SelectItem>
                  <SelectItem value="org" className="text-white hover:bg-gray-700">Organization</SelectItem>
                  <SelectItem value="public" className="text-white hover:bg-gray-700">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleCreateTemplate} disabled={!templateData.title || createTemplate.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              {createTemplate.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Template Builder */}
      {templateId && (
        <div className="space-y-6">
          {/* Template Actions */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Template Builder</h2>
            <Button onClick={handleCreateProgram} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>

          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-600">
              <TabsTrigger value="builder" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">Builder</TabsTrigger>
              <TabsTrigger value="grid" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">
                <Grid className="w-4 h-4 mr-2" />
                Grid View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Week/Day Navigator */}
                <GlassCard className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Week & Day</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-200 font-medium">Week</Label>
                      <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                        <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white focus:border-blue-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(week => (
                            <SelectItem key={week} value={week.toString()} className="text-white hover:bg-gray-700">Week {week}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-200 font-medium">Day</Label>
                      <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                        <SelectTrigger className="bg-gray-800/80 border-gray-600 text-white focus:border-blue-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()} className="text-white hover:bg-gray-700">Day {day}</SelectItem>
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
                      <div key={exercise.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-600">
                        <div>
                          <p className="text-white font-medium">{exercise.name}</p>
                          <p className="text-gray-300 text-sm">{exercise.category} • {exercise.primary_muscle}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddExercise(exercise.id)}
                          className="text-white hover:bg-gray-700"
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
                    <Badge variant="outline" className="text-white border-gray-400">
                      {currentBlock?.exercises.length || 0} exercises
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {currentBlock?.exercises.map((exercise, index) => {
                      const exerciseInfo = exerciseOptions.find(e => e.id === exercise.exercise_id);
                      return (
                        <div key={index} className="p-3 bg-gray-800/50 rounded border border-gray-600">
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
                              <Label className="text-gray-300 text-xs">Sets</Label>
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => handleUpdateExercise(index, { sets: parseInt(e.target.value) })}
                                className="bg-gray-800/80 border-gray-600 text-white h-8 focus:border-blue-400"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Reps</Label>
                              <Input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => handleUpdateExercise(index, { reps: parseInt(e.target.value) })}
                                className="bg-gray-800/80 border-gray-600 text-white h-8 focus:border-blue-400"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Load %</Label>
                              <Input
                                type="number"
                                value={exercise.load_percent || ''}
                                onChange={(e) => handleUpdateExercise(index, { load_percent: parseInt(e.target.value) })}
                                className="bg-gray-800/80 border-gray-600 text-white h-8 focus:border-blue-400"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300 text-xs">Rest (s)</Label>
                              <Input
                                type="number"
                                value={exercise.rest_seconds || ''}
                                onChange={(e) => handleUpdateExercise(index, { rest_seconds: parseInt(e.target.value) })}
                                className="bg-gray-800/80 border-gray-600 text-white h-8 focus:border-blue-400"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(!currentBlock || currentBlock.exercises.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No exercises added yet</p>
                      <p className="text-gray-500 text-sm">Select exercises from the library to get started</p>
                    </div>
                  )}
                </GlassCard>
              </div>
            </TabsContent>

            <TabsContent value="grid" className="space-y-6">
              <TemplateGridView templateId={templateId} />
            </TabsContent>
          </Tabs>

          <CreateProgramFromTemplateDialog
            open={showCreateProgramDialog}
            onOpenChange={setShowCreateProgramDialog}
            template={selectedTemplate}
          />
        </div>
      )}
    </div>
  );
};
