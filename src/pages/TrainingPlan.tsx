
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TrainingPlanLayout } from '@/components/training-plan/TrainingPlanLayout';
import { MyProgramsScreen } from '@/components/training-plan/MyProgramsScreen';

const TrainingPlan: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<TrainingPlanLayout />}>
        <Route index element={<Navigate to="programs" replace />} />
        <Route path="programs" element={<MyProgramsScreen />} />
      </Route>
    </Routes>
  );
};

export default TrainingPlan;
