import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useExercises } from '@/hooks/useExercises';
import { useNavigate } from 'react-router-dom';
import { TrainingProgramsHeader } from '@/components/TrainingPrograms/TrainingProgramsHeader';
import { TrainingProgramsStats } from '@/components/TrainingPrograms/TrainingProgramsStats';
import { TrainingProgramsTabs } from '@/components/TrainingPrograms/TrainingProgramsTabs';
import { TrainingProgramsModals } from '@/components/TrainingPrograms/TrainingProgramsModals';
import { GlassCard } from '@/components/ui';
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

  const handleCloseTemplate = (refresh?: boolean) => {
    setShowTemplateBuilder(false);
    if (refresh) {
      refetchTemplates();
    }
  };

  const handleCloseProgram = (refresh?: boolean) => {
    setShowProgramBuilder(false);
    if (refresh) {
      refetchTemplates();
    }
  };

  // Calculate stats
  const totalTemplates = templates.length + programTemplates.length;
  const activePrograms = programTemplates.filter(p => p.origin === 'KAI').length;
  const totalExercises = exercises.length;

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header Card */}
      <GlassCard className="p-6">
        <TrainingProgramsHeader 
          isCoach={isCoach}
          onCreateTemplate={handleCreateTemplate}
        />
      </GlassCard>

      {/* Stats Card */}
      <GlassCard className="p-6">
        <TrainingProgramsStats
          totalTemplates={totalTemplates}
          activePrograms={activePrograms}
          totalExercises={totalExercises}
        />
      </GlassCard>

      {/* Main Content Card */}
      <GlassCard className="p-6 min-h-[600px]">
        <TrainingProgramsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          templates={templates}
          workoutTemplates={workoutTemplates}
          isCoach={isCoach}
          isSolo={isSolo}
          deleteLoading={deleteTemplate.isPending}
          onView={handleViewTemplate}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onAssignTemplate={handleAssignTemplate}
          onCreateTemplate={handleCreateTemplate}
          onCreateProgram={handleCreateProgram}
        />
      </GlassCard>

      <TrainingProgramsModals
        showTemplateBuilder={showTemplateBuilder}
        showProgramBuilder={showProgramBuilder}
        selectedTemplate={selectedTemplate}
        showAssignDialog={showAssignDialog}
        onCloseTemplate={handleCloseTemplate}
        onCloseProgram={handleCloseProgram}
        onCloseAssignDialog={() => setShowAssignDialog(false)}
      />
    </div>
  );
};

export default TrainingPrograms;
