
import React from 'react';
import { Outlet } from 'react-router-dom';
import { TrainingPlanKpiCards } from './TrainingPlanKpiCards';
import { TrainingPlanTabs } from './TrainingPlanTabs';

export const TrainingPlanLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Training Plan</h1>
          <p className="text-white/70">Your personalized training schedule</p>
        </div>

        {/* KPI Cards */}
        <TrainingPlanKpiCards />

        {/* Tab Bar */}
        <TrainingPlanTabs />

        {/* Tab Content */}
        <Outlet />
      </div>
    </div>
  );
};
