
import React from 'react';
import { Outlet } from 'react-router-dom';
import { TrainingPlanKpiCards } from './TrainingPlanKpiCards';
import { Container } from '@/components/layout/Container';
import { useFabPosition } from '@/hooks/useFabPosition';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MyProgramsScreen } from './MyProgramsScreen';
import { ProgramInstancesTab } from './ProgramInstancesTab';
import { LibraryTab } from './LibraryTab';
import { Target, Activity, BookOpen } from 'lucide-react';

export const TrainingPlanLayout: React.FC = () => {
  const { contentPadding } = useFabPosition();

  return (
    <div className={cn("min-h-screen w-full bg-brand-charcoal", contentPadding)}>
      <Container>
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Training Plan</h1>
          <p className="text-muted-foreground">Your personalized training schedule</p>
        </div>

        {/* KPI Cards */}
        <TrainingPlanKpiCards />

        {/* TabView with three tabs */}
        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1 grid w-full grid-cols-3 mb-6">
            <TabsTrigger 
              value="programs" 
              className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Programs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="instances" 
              className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Instances</span>
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="mt-0">
            <MyProgramsScreen />
          </TabsContent>

          <TabsContent value="instances" className="mt-0">
            <ProgramInstancesTab />
          </TabsContent>

          <TabsContent value="library" className="mt-0">
            <LibraryTab />
          </TabsContent>
        </Tabs>

        {/* Remove the old Outlet since we're now using TabsContent */}
      </Container>
    </div>
  );
};
