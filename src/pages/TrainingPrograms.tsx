
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { TrainingObjectsHeader } from '@/components/TrainingObjects/TrainingObjectsHeader';
import { TemplateCard } from '@/components/TrainingObjects/TemplateCard';
import { WorkoutTemplates } from '@/components/WorkoutTemplates';
import { WorkoutTemplateList } from '@/components/WorkoutTemplateList';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useExercises } from '@/hooks/useExercises';
import { useNavigate } from 'react-router-dom';
import { NewTemplateBuilder } from '@/components/NewTemplateBuilder';
import ProgramBuilder from '@/components/ProgramBuilder';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';
import { AssignTemplateDialog } from '@/components/AssignTemplateDialog';
import { toast } from '@/hooks/use-toast';

const TrainingPrograms = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const isCoach = profile?.role === 'coach';
  const isSolo = profile?.role === 'solo';

  // Data hooks
  const { data: templates = [], refetch: refetchTemplates } = useTemplates();
  const { data: programTemplates = [] } = useProgramTemplates();
  const { data: workoutTemplates = [] } = useWorkoutTemplates();
  const { data: exercises = [] } = useExercises();
  const deleteTemplate = useDeleteTemplate();

  const handleCreateTemplate = () => {
    setShowTemplateBuilder(true);
  };

  const handleCreateProgram = () => {
    setShowProgramBuilder(true);
  };

  const handleViewTemplate = (templateId: string) => {
    navigate(`/template/${templateId}`);
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/template/${templateId}?edit=true`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      refetchTemplates();
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowAssignDialog(true);
  };

  // Calculate stats
  const totalTemplates = templates.length + programTemplates.length;
  const activePrograms = programTemplates.filter(p => p.origin === 'KAI').length;
  const totalExercises = exercises.length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <TrainingObjectsHeader 
        isCoach={isCoach}
        onCreateTemplate={handleCreateTemplate}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercise Library</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExercises}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Training Templates</h2>
              <p className="text-gray-600">Create and manage training templates</p>
            </div>
            {isCoach && (
              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
                <Button onClick={handleCreateProgram} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Program
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isCoach={isCoach}
                isSolo={isSolo}
                deleteLoading={deleteTemplate.isPending}
                onView={handleViewTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
              {isCoach && (
                <div className="mt-6">
                  <Button onClick={handleCreateTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <WorkoutTemplates
            templates={workoutTemplates}
            isLoading={false}
            isCoach={isCoach}
            onAssignTemplate={handleAssignTemplate}
          />
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <ExerciseLibrary />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track training performance and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Performance tracking coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals and Dialogs */}
      {showTemplateBuilder && (
        <NewTemplateBuilder
          onClose={(refresh) => {
            setShowTemplateBuilder(false);
            if (refresh) {
              refetchTemplates();
            }
          }}
        />
      )}

      <ProgramBuilder
        isOpen={showProgramBuilder}
        onClose={(refresh) => {
          setShowProgramBuilder(false);
          if (refresh) {
            refetchTemplates();
          }
        }}
      />

      {selectedTemplate && (
        <AssignTemplateDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default TrainingPrograms;
