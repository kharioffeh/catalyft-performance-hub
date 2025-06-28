
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingProgramsTemplatesTab } from './TrainingProgramsTemplatesTab';
import { TrainingProgramsProgramsTab } from './TrainingProgramsProgramsTab';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { PerformanceTab } from '@/components/PerformanceTab';

interface TrainingProgramsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  templates: any[];
  workoutTemplates: any[];
  isCoach: boolean;
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
  isCoach,
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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="programs">Programs</TabsTrigger>
        <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="templates" className="space-y-6">
        <TrainingProgramsTemplatesTab
          templates={templates}
          isCoach={isCoach}
          isSolo={isSolo}
          deleteLoading={deleteLoading}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateTemplate={onCreateTemplate}
          onCreateProgram={onCreateProgram}
        />
      </TabsContent>

      <TabsContent value="programs" className="space-y-6">
        <TrainingProgramsProgramsTab
          workoutTemplates={workoutTemplates}
          isCoach={isCoach}
          onAssignTemplate={onAssignTemplate}
        />
      </TabsContent>

      <TabsContent value="exercises" className="space-y-6">
        <ExerciseLibrary />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <PerformanceTab />
      </TabsContent>
    </Tabs>
  );
};
