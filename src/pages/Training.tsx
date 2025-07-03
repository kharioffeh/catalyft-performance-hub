
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { TrainingProgramsPager } from '@/components/TrainingPrograms/TrainingProgramsPager';
import { TrainingSessionsList } from '@/components/training/TrainingSessionsList';
import { TrainingPlanner } from '@/components/training/TrainingPlanner';
import { GlassCard } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useSessions } from '@/hooks/useSessions';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Dumbbell, Clock, Target } from 'lucide-react';

const Training: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('calendar');

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

  const tabs = [
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      component: (
        <TrainingCalendar
          sessions={sessions}
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
          sessions={sessions}
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
          sessions={sessions}
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
        <h1 className="text-2xl font-bold text-white mb-2">Training</h1>
        <p className="text-white/70">
          Manage your training programs, schedule sessions, and track progress with ARIA insights
        </p>
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
    </div>
  );
};

export default Training;
