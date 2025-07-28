
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingProgramsPager } from './TrainingProgramsPager';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { PerformanceTab } from '@/components/PerformanceTab';

interface TrainingProgramsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  templates: any[];
  workoutTemplates: any[];
  isSolo: boolean;
  deleteLoading: boolean;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onAssignTemplate: (template: any) => void;
  onCreateTemplate: () => void;
  onCreateProgram: () => void;
}

export const TrainingProgramsTabs: React.FC<TrainingProgramsTabsProps> = ({
  activeTab,
  setActiveTab,
  templates,
  workoutTemplates,
  isSolo,
  deleteLoading,
  onView,
  onEdit,
  onDelete,
  onAssignTemplate,
  onCreateTemplate,
  onCreateProgram,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/5 border border-white/10">
        <TabsTrigger value="programs" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Training
        </TabsTrigger>
        <TabsTrigger value="exercises" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Exercise Library
        </TabsTrigger>
        <TabsTrigger value="performance" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Performance
        </TabsTrigger>
        <TabsTrigger value="workouts" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Workouts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="programs" className="mt-6">
        <TrainingProgramsPager 
          templates={templates} 
          isSolo={isSolo}
          deleteLoading={deleteLoading}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateTemplate={onCreateTemplate}
          onCreateProgram={onCreateProgram}
        />
      </TabsContent>

      <TabsContent value="exercises" className="mt-6">
        <ExerciseLibrary />
      </TabsContent>

      <TabsContent value="performance" className="mt-6">
        <PerformanceTab />
      </TabsContent>

      <TabsContent value="workouts" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workoutTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => onAssignTemplate(template)}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-white/60 text-sm mb-4">{template.description}</p>
              <div className="flex items-center justify-between text-sm text-white/50">
                <span>{template.estimated_duration || 'N/A'} min</span>
                <span>Level {template.difficulty_level || 1}</span>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
