
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Dumbbell, Library, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useAssignedWorkouts } from '@/hooks/useAssignedWorkouts';
import { WorkoutTemplateList } from '@/components/WorkoutTemplateList';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { CreateTemplateDialog } from '@/components/CreateTemplateDialog';
import { AssignWorkoutDialog } from '@/components/AssignWorkoutDialog';
import { GenerateProgramDialog } from '@/components/GenerateProgramDialog';
import { TemplateCard } from '@/components/TemplateCard';
import { TemplateModal } from '@/components/TemplateModal';
import { AssignTemplateDialog } from '@/components/AssignTemplateDialog';
import { useTemplateModal } from '@/store/useTemplateModal';
import { WorkoutTemplate } from '@/types/workout';

const Workout: React.FC = () => {
  const { profile } = useAuth();
  const { data: workoutTemplates = [], isLoading: templatesLoading } = useWorkoutTemplates();
  const { data: programTemplates = [], isLoading: programTemplatesLoading } = useProgramTemplates();
  const { data: assignedWorkouts = [], isLoading: assignedLoading } = useAssignedWorkouts();
  
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isAssignWorkoutOpen, setIsAssignWorkoutOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [assignTemplate, setAssignTemplate] = useState(null);
  const { tpl, close } = useTemplateModal();

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    console.log('Template selected:', template);
    // Here you could open a detailed view or edit dialog
  };

  const handleAssignTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setIsAssignWorkoutOpen(true);
  };

  const openAssignDialog = (template) => {
    setAssignTemplate(template);
  };

  const getStatsCards = () => {
    const completedWorkouts = assignedWorkouts.filter(w => w.status === 'completed').length;
    const pendingWorkouts = assignedWorkouts.filter(w => w.status === 'assigned').length;
    const totalTemplates = workoutTemplates.length + programTemplates.length;

    return [
      {
        title: 'Total Templates',
        value: totalTemplates,
        icon: Library,
        description: 'All workout and program templates'
      },
      {
        title: 'Completed Workouts',
        value: completedWorkouts,
        icon: BarChart3,
        description: 'Workouts finished'
      },
      {
        title: 'Pending Workouts',
        value: pendingWorkouts,
        icon: Calendar,
        description: 'Workouts assigned'
      }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Workout System</h1>
        </div>
        <div className="flex gap-2">
          {profile?.role === 'coach' && (
            <>
              <Button 
                onClick={() => setIsGenerateOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Generate with KAI
              </Button>
              <Button 
                onClick={() => setIsCreateTemplateOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {getStatsCards().map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs">Program Templates</TabsTrigger>
          <TabsTrigger value="templates">Workout Templates</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="assigned">Assigned Workouts</TabsTrigger>
          {profile?.role === 'athlete' && (
            <TabsTrigger value="performance">My Performance</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KAI Program Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {programTemplatesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : programTemplates.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                  {programTemplates.map((template) => (
                    <TemplateCard 
                      key={template.id} 
                      template={template}
                      onAssign={openAssignDialog}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Program Templates</h3>
                    <p className="text-gray-500 mb-4">
                      Generate your first AI-powered training program with KAI
                    </p>
                    {profile?.role === 'coach' && (
                      <Button onClick={() => setIsGenerateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate with KAI
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workout Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : workoutTemplates.length > 0 ? (
                <WorkoutTemplateList
                  templates={workoutTemplates}
                  onTemplateSelect={handleTemplateSelect}
                  onAssignTemplate={profile?.role === 'coach' ? handleAssignTemplate : undefined}
                  showAssignButton={profile?.role === 'coach'}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No workout templates created yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Library</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseLibrary />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : assignedWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {assignedWorkouts.map((workout) => (
                    <Card key={workout.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{workout.template?.name}</h3>
                            <p className="text-sm text-gray-600">
                              Assigned: {new Date(workout.assigned_date).toLocaleDateString()}
                            </p>
                            {workout.due_date && (
                              <p className="text-sm text-gray-600">
                                Due: {new Date(workout.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              workout.status === 'completed' ? 'bg-green-100 text-green-800' :
                              workout.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              workout.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {workout.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No workouts assigned yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {profile?.role === 'athlete' && (
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Performance tracking coming soon
                </div>
              </CardContent>
            </Card>
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

      <GenerateProgramDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      {tpl && (
        <TemplateModal
          template={tpl}
          open={!!tpl}
          onOpenChange={(open) => !open && close()}
          onAssign={openAssignDialog}
        />
      )}

      <AssignTemplateDialog
        template={assignTemplate}
        open={!!assignTemplate}
        onOpenChange={(open) => !open && setAssignTemplate(null)}
      />
    </div>
  );
};

export default Workout;
