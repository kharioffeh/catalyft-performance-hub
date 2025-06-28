
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Dumbbell, BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useAssignedWorkouts } from '@/hooks/useAssignedWorkouts';
import { WorkoutStats } from '@/components/WorkoutStats';
import { WorkoutTemplates } from '@/components/WorkoutTemplates';
import { AssignedWorkoutsTab } from '@/components/AssignedWorkoutsTab';
import { PerformanceTab } from '@/components/PerformanceTab';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { AssignWorkoutDialog } from '@/components/AssignWorkoutDialog';
import { AssignTemplateDialog } from '@/components/AssignTemplateDialog';
import { TemplateModal } from '@/components/TemplateModal';
import { useTemplateModal } from '@/store/useTemplateModal';
import { WorkoutTemplate } from '@/types/workout';
import ProgramBuilder from '@/components/ProgramBuilder';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useNavigate } from 'react-router-dom';

const Workout: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: templates = [], isLoading: templatesLoading, refetch: refetchWorkoutTemplates } = useWorkoutTemplates();
  const { data: programTemplates = [], refetch: refetchProgramTemplates } = useProgramTemplates();
  const { data: assignedWorkouts = [], isLoading: assignedLoading } = useAssignedWorkouts();
  
  const [isProgramBuilderOpen, setIsProgramBuilderOpen] = useState(false);
  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false);
  const [isAssignTemplateOpen, setIsAssignTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const { tpl: modalTemplate, close: closeModal } = useTemplateModal();

  const handleAssignTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setIsAssignTemplateOpen(true);
  };

  const isCoach = profile?.role === 'coach';

  // Transform program templates to match WorkoutTemplate interface
  const transformedProgramTemplates: WorkoutTemplate[] = programTemplates.map(pt => ({
    id: pt.id,
    coach_uuid: pt.coach_uuid,
    name: pt.name,
    description: `${pt.block_json?.weeks?.length || 0} weeks`,
    category: 'program',
    is_public: false,
    created_at: pt.created_at,
    updated_at: pt.updated_at,
    block_json: pt.block_json,
    origin: pt.origin
  }));

  // Combine workout templates and transformed program templates
  const allTemplates = [...templates, ...transformedProgramTemplates];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Workout System</h1>
        </div>
        {isCoach && (
          <Button 
            onClick={() => setIsProgramBuilderOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        )}
      </div>

      {/* New Training Objects System Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-blue-900">New: Training Objects System</CardTitle>
                <CardDescription className="text-blue-700">
                  Advanced template and program management with enhanced features
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => navigate('/training-objects')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Explore
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Template Grid View</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Atomic Program Creation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Session Management</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <WorkoutStats templates={allTemplates} assignedWorkouts={assignedWorkouts} />

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Legacy Templates</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Workouts</TabsTrigger>
          {profile?.role === 'athlete' && (
            <TabsTrigger value="performance">My Performance</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <WorkoutTemplates
            templates={allTemplates}
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

      <ProgramBuilder 
        isOpen={isProgramBuilderOpen} 
        onClose={(refresh) => { 
          setIsProgramBuilderOpen(false); 
          if (refresh) {
            refetchWorkoutTemplates();
            refetchProgramTemplates();
          }
        }} 
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
