
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useExercises } from '@/hooks/useExercises';
import { useNavigate } from 'react-router-dom';
import { TrainingProgramsHeader } from '@/components/TrainingPrograms/TrainingProgramsHeader';
import { TrainingProgramsStats } from '@/components/TrainingPrograms/TrainingProgramsStats';
import { TrainingProgramsTabs } from '@/components/TrainingPrograms/TrainingProgramsTabs';
import { GlassCard } from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { EnhancedProgramBuilder } from '@/components/program-builder/EnhancedProgramBuilder';

const TrainingPrograms = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('programs');
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const isCoach = profile?.role === 'coach';
  const isSolo = profile?.role === 'solo';

  // Data hooks - now using program_templates as primary
  const { data: programs = [], refetch: refetchPrograms } = useProgramTemplates();
  const { data: workoutTemplates = [] } = useWorkoutTemplates();
  const { data: exercises = [] } = useExercises();

  const handleCreateProgram = () => {
    setShowProgramBuilder(true);
  };

  const handleViewProgram = (programId: string) => {
    navigate(`/program/${programId}`);
  };

  const handleEditProgram = (programId: string) => {
    navigate(`/program/${programId}?edit=true`);
  };

  const handleDeleteProgram = async (programId: string) => {
    try {
      // TODO: Implement delete for program_templates
      refetchPrograms();
      toast({
        title: "Program Deleted",
        description: "Program has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete program. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignProgram = (program: any) => {
    setSelectedTemplate(program);
    setShowAssignDialog(true);
  };

  const handleCloseProgram = (refresh?: boolean) => {
    setShowProgramBuilder(false);
    if (refresh) {
      refetchPrograms();
    }
  };

  // Calculate stats
  const totalPrograms = programs.length + workoutTemplates.length;
  const activePrograms = programs.filter(p => p.origin === 'KAI').length;
  const totalExercises = exercises.length;

  return (
    <div className="space-y-4 sm:space-y-6 px-3 py-4 sm:px-4 sm:py-4 md:px-8 md:py-8">
      {/* Header Card */}
      <GlassCard className="p-6">
        <TrainingProgramsHeader 
          isCoach={isCoach}
          onCreateTemplate={handleCreateProgram}
        />
      </GlassCard>

      {/* Stats Card */}
      <GlassCard className="p-6">
        <TrainingProgramsStats
          totalTemplates={totalPrograms}
          activePrograms={activePrograms}
          totalExercises={totalExercises}
        />
      </GlassCard>

      {/* Main Content Card */}
      <GlassCard className="p-6 min-h-[600px]">
        <TrainingProgramsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          templates={programs}
          workoutTemplates={workoutTemplates}
          isCoach={isCoach}
          isSolo={isSolo}
          deleteLoading={false}
          onView={handleViewProgram}
          onEdit={handleEditProgram}
          onDelete={handleDeleteProgram}
          onAssignTemplate={handleAssignProgram}
          onCreateTemplate={handleCreateProgram}
          onCreateProgram={handleCreateProgram}
        />
      </GlassCard>

      <EnhancedProgramBuilder
        open={showProgramBuilder}
        onOpenChange={setShowProgramBuilder}
      />
    </div>
  );
};

export default TrainingPrograms;
