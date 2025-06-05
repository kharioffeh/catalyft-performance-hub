
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import DashboardPage from './pages/Dashboard';
import AthletesPage from './pages/Athletes';
import WorkoutsPage from './pages/Workout';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ForgotPasswordPage from './pages/Auth';
import ResetPasswordPage from './pages/Auth';
import CalendarPage from './pages/Calendar';
import ChatPage from './pages/Chat';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RiskBoardPage from './pages/CoachRiskBoard';
import KAIPage from './pages/KAIPage';
import TemplateDetailPage from '@/pages/TemplateDetailPage';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="athletes" element={<AthletesPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="risk-board" element={<RiskBoardPage />} />
              <Route path="workouts" element={<WorkoutsPage />} />
              <Route path="workout" element={<WorkoutsPage />} />
              <Route path="kai" element={<KAIPage />} />
              <Route path="template/:id" element={<TemplateDetailPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
