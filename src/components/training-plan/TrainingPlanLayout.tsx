
import React from 'react';
import { Outlet } from 'react-router-dom';
import { TrainingPlanKpiCards } from './TrainingPlanKpiCards';
import { TrainingPlanTabs } from './TrainingPlanTabs';
import { Container } from '@/components/layout/Container';
import { useFabPosition } from '@/hooks/useFabPosition';
import { cn } from '@/lib/utils';

export const TrainingPlanLayout: React.FC = () => {
  const { contentPadding } = useFabPosition();

  return (
    <div className={cn("min-h-screen bg-background p-6", contentPadding)}>
      <Container>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Training Plan</h1>
          <p className="text-muted-foreground">Your personalized training schedule</p>
        </div>

        {/* KPI Cards */}
        <TrainingPlanKpiCards />

        {/* Tab Bar */}
        <TrainingPlanTabs />

        {/* Tab Content */}
        <Outlet />
      </Container>
    </div>
  );
};
