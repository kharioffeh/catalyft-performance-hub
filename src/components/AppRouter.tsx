
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/Dashboard';
import AnalyticsPage from '../pages/Analytics';
import ReadinessDetailPage from '../pages/ReadinessDetailPage';
import SleepDetailPage from '../pages/SleepDetailPage';
import LoadDetailPage from '../pages/LoadDetailPage';
import AthletesPage from '../pages/Athletes';
import WorkoutsPage from '../pages/Workout';
import SettingsPage from '../pages/Settings';
import SubscriptionsPage from '../pages/Subscriptions';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import ForgotPasswordPage from '../pages/Auth';
import ResetPasswordPage from '../pages/Auth';
import FinishSignupPage from '../pages/FinishSignup';
import CalendarPage from '../pages/Calendar';
import ChatPage from '../pages/Chat';
import AppLayout from './AppLayout';
import ProtectedRoute from './ProtectedRoute';
import RiskBoardPage from '../pages/CoachRiskBoard';
import KAIPage from '../pages/KAIPage';
import TemplateDetailPage from '@/pages/TemplateDetailPage';
import { useSupabaseHash } from '../hooks/useSupabaseHash';

const AppRouter: React.FC = () => {
  // Handle hash-based authentication redirects - now inside Router context
  useSupabaseHash();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/finish-signup" element={<FinishSignupPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="analytics/readiness" element={<ReadinessDetailPage />} />
        <Route path="analytics/sleep" element={<SleepDetailPage />} />
        <Route path="analytics/load" element={<LoadDetailPage />} />
        <Route path="athletes" element={<AthletesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="risk-board" element={<RiskBoardPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="workout" element={<WorkoutsPage />} />
        <Route path="kai" element={<KAIPage />} />
        <Route path="template/:id" element={<TemplateDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
