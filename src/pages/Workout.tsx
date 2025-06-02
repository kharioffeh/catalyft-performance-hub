
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useAssignedWorkouts } from '@/hooks/useAssignedWorkouts';
import { WorkoutStats } from '@/components/WorkoutStats';
import { WorkoutTemplates } from '@/components/WorkoutTemplates';
import { AssignedWorkoutsTab } from '@/components/AssignedWorkoutsTab';
import { PerformanceTab } from '@/components/PerformanceTab';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { CreateTemplateDialog } from '@/components/CreateTemplateDialog';
import { AssignWorkoutDialog } from '@/components/AssignWorkoutDialog';
import { AssignTemplateDialog } from '@/components/AssignTemplateDialog';
import { TemplateModal } from '@/components/TemplateModal';
import { useTemplateModal } from '@/store/useTemplateModal';
import { WorkoutTemplate } from '@/types/workout';

const Workout: React.FC = () => {
  const { profile } = useAuth();
  const { data: templates = [], isLoading: templatesLoading } = useWorkoutTemplates();
  const { data: assignedWorkouts = [], isLoading: assignedLoading } = useAssignedWorkouts();
  
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false);
  const [isAssignTemplateOpen, setIsAssignTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const { tpl: modalTemplate, close: closeModal } = useTemplateModal();

  const handleAssignTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setIsAssignTemplateOpen(true);
  };

  const isCoach = profile?.role === 'coach';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Workout System</h1>
        </div>
        {isCoach && (
          <Button 
            onClick={() => setIsCreateTemplateOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        )}
      </div>

      <WorkoutStats templates={templates} assignedWorkouts={assignedWorkouts} />

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Workouts</TabsTrigger>
          {profile?.role === 'athlete' && (
            <TabsTrigger value="performance">My Performance</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <WorkoutTemplates
            templates={templates}
            isLoading={templatesLoading}
            isCoach={isCoach}
            onAssignTemplate={handleAssignTemplate}
          />
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <ExerciseLibrary />
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <AssignedWorkoutsTab
            assignedWorkouts={assignedWorkouts}
            isLoading={assignedLoading}
          />
        </TabsContent>

        {profile?.role === 'athlete' && (
          <TabsContent value="performance" className="space-y-4">
            <PerformanceTab />
          </TabsContent>
        )}
      </Tabs>

      <CreateTemplateDialog
        open={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
      />

      <AssignWorkoutDialog
        open={isAssignWorkoutOpen}
        onOpenChange={setIsAssignWorkoutOpen}
        template={selectedTemplate}
      />

      <AssignTemplateDialog
        open={isAssignTemplateOpen}
        onOpenChange={setIsAssignTemplateOpen}
        template={selectedTemplate}
      />

      <TemplateModal
        template={modalTemplate}
        open={!!modalTemplate}
        onOpenChange={(open) => !open && closeModal()}
        onAssign={handleAssignTemplate}
      />
    </div>
  );
};

export default Workout;
