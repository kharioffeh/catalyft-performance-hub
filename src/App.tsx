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
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RiskBoardPage from './pages/CoachRiskBoard';
import TemplatesPage from './pages/TemplatesPage';
import TemplatePage from './pages/TemplatePage';
import TemplateDetailPage from '@/pages/TemplateDetailPage';
import Toaster from './components/Toaster';

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
              <Route path="risk-board" element={<RiskBoardPage />} />
              <Route path="workouts" element={<WorkoutsPage />} />
              <Route path="workout" element={<WorkoutsPage />} />
              <Route path="templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/template/:id" element={<ProtectedRoute><TemplateDetailPage /></ProtectedRoute>} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
