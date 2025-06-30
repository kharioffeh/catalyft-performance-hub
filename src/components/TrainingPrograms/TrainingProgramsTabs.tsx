
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
      <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
        <TabsTrigger value="programs" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Training
        </TabsTrigger>
        <TabsTrigger value="exercises" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Exercise Library
        </TabsTrigger>
        <TabsTrigger value="performance" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Performance
        </TabsTrigger>
        <TabsTrigger value="analytics" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="programs" className="space-y-6 mt-6">
        <TrainingProgramsPager
          templates={templates}
          workoutTemplates={workoutTemplates}
          isCoach={isCoach}
          deleteLoading={deleteLoading}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignTemplate={onAssignTemplate}
          onCreateTemplate={onCreateTemplate}
          onCreateProgram={onCreateProgram}
        />
      </TabsContent>

      <TabsContent value="exercises" className="space-y-6 mt-6">
        <ExerciseLibrary />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6 mt-6">
        <PerformanceTab />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6 mt-6">
        <div className="text-center py-12 text-white/60">
          Analytics coming soon
        </div>
      </TabsContent>
    </Tabs>
  );
};
