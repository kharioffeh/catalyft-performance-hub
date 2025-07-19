import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';
import CalendarPage from '@/pages/CalendarPage';
import Athletes from '@/pages/Athletes';
import RiskBoard from '@/pages/RiskBoard';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';
import Workout from '@/pages/Workout';
import TrainingPlan from '@/pages/TrainingPlan';
import Analytics from '@/pages/Analytics';
import ProgramPage from '@/pages/solo/ProgramPage';
import TemplatePage from '@/pages/TemplatePage';
import TrainingObjects from '@/pages/TrainingObjects';
import LiveSession from '@/pages/LiveSession';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from '@tanstack/react-query';
import ProgramInstanceView from '@/pages/ProgramInstanceView';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Toaster />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/athletes" element={<Athletes />} />
            <Route path="/risk-board" element={<RiskBoard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/training-plan/*" element={<TrainingPlan />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/program" element={<ProgramPage />} />
            <Route path="/template/:id" element={<TemplatePage />} />
            <Route path="/training-objects" element={<TrainingObjects />} />
            <Route path="/live" element={<LiveSession />} />
            <Route path="/program-instance/:id" element={<ProgramInstanceView />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
