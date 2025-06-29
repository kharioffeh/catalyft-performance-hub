
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TrainingPlanLayout } from '@/components/training-plan/TrainingPlanLayout';
import { TemplatesTab } from '@/components/training-plan/TemplatesTab';
import { ProgramsTab } from '@/components/training-plan/ProgramsTab';
import { LibraryTab } from '@/components/training-plan/LibraryTab';

const TrainingPlan: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<TrainingPlanLayout />}>
        <Route index element={<Navigate to="templates" replace />} />
        <Route path="templates" element={<TemplatesTab />} />
        <Route path="programs" element={<ProgramsTab />} />
        <Route path="library" element={<LibraryTab />} />
      </Route>
    </Routes>
  );
};

export default TrainingPlan;
