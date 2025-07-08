
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { TrainingProgramsPager } from '@/components/TrainingPrograms/TrainingProgramsPager';
import { TrainingSessionsList } from '@/components/training/TrainingSessionsList';
import { TrainingPlanner } from '@/components/training/TrainingPlanner';
import { GoalIntakeWizard } from '@/components/training/GoalIntakeWizard';
import { GlassCard } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useSessions } from '@/hooks/useSessions';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Dumbbell, Clock, Target, Plus } from 'lucide-react';

const Training: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('calendar');
  const [goalWizardOpen, setGoalWizardOpen] = useState(false);

  const { data: programs = [] } = useProgramTemplates();
  const { data: workoutTemplates = [] } = useWorkoutTemplates();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const isCoach = profile?.role === 'coach';

  const handleViewProgram = (programId: string) => {
    // Navigate to program detail
    console.log('View program:', programId);
  };

  const handleEditProgram = (programId: string) => {
    // Navigate to program edit
    console.log('Edit program:', programId);
  };

  const handleDeleteProgram = (programId: string) => {
    // Handle program deletion
    console.log('Delete program:', programId);
  };

  const handleAssignProgram = (program: any) => {
    // Handle program assignment
    console.log('Assign program:', program);
  };

  const handleCreateProgram = () => {
    // Handle program creation
    console.log('Create program');
  };

  // Convert sessions from the hook to match the expected format
  const formattedSessions = sessions.map(session => ({
    id: session.id,
    athlete_uuid: session.program?.athlete_uuid || '',
    coach_uuid: session.program?.coach_uuid || '',
    type: 'training', // Default type since sessions don't have a type field
    start_ts: session.planned_at,
    end_ts: session.completed_at || session.planned_at,
    notes: '',
    status: session.completed_at ? 'completed' : 'planned',
    athletes: {
      name: 'Athlete' // Default name since we don't have athlete details
    }
  }));

  const tabs = [
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      component: (
        <TrainingCalendar
          sessions={formattedSessions}
          isLoading={sessionsLoading}
          queryClient={queryClient}
          isMobile={false}
        />
      )
    },
    {
      id: 'programs',
      label: 'Programs',
      icon: Dumbbell,
      component: (
        <TrainingProgramsPager
          templates={programs}
          workoutTemplates={workoutTemplates}
          isCoach={isCoach}
          onView={handleViewProgram}
          onEdit={handleEditProgram}
          onDelete={handleDeleteProgram}
          onAssignTemplate={handleAssignProgram}
          onCreateTemplate={handleCreateProgram}
          onCreateProgram={handleCreateProgram}
          deleteLoading={false}
        />
      )
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: Clock,
      component: (
        <TrainingSessionsList
          sessions={formattedSessions}
          isLoading={sessionsLoading}
          isCoach={isCoach}
        />
      )
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: Target,
      component: (
        <TrainingPlanner
          sessions={formattedSessions}
          programs={programs}
          isLoading={sessionsLoading}
          isCoach={isCoach}
        />
      )
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Training</h1>
            <p className="text-white/70">
              Manage your training programs, schedule sessions, and track progress with ARIA insights
            </p>
          </div>
          <Button
            onClick={() => setGoalWizardOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Set Goal
          </Button>
        </div>
      </div>

      <GlassCard className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-0 min-h-[600px]"
            >
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </GlassCard>

      <GoalIntakeWizard
        open={goalWizardOpen}
        onOpenChange={setGoalWizardOpen}
      />
    </div>
  );
};

export default Training;
