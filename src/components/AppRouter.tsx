import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/Dashboard';
import AnalyticsPage from '../pages/Analytics';
import ReadinessDetailPage from '../pages/ReadinessDetailPage';
import SleepDetailPage from '../pages/SleepDetailPage';
import LoadDetailPage from '../pages/LoadDetailPage';
import AthletesPage from '../pages/Athletes';
import TrainingPrograms from '../pages/TrainingPrograms';
import SettingsPage from '../pages/Settings';
import SubscriptionsPage from '../pages/Subscriptions';
import BillingEnhancedPage from '../pages/BillingEnhanced';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import ForgotPasswordPage from '../pages/Auth';
import ResetPasswordPage from '../pages/Auth';
import FinishSignupPage from '../pages/FinishSignup';
import CalendarPage from '../pages/Calendar';
import ChatPage from '../pages/Chat';
import HomePage from '../pages/Home';
import OAuthCallback from '../pages/OAuthCallback';
import SoloProgramPage from '../pages/solo/ProgramPage';
import AppLayout from './AppLayout';
import ProtectedRoute from './ProtectedRoute';
import ProtectAppGate from './ProtectAppGate';
import RiskBoardPage from '../pages/CoachRiskBoard';
import TemplateDetailPage from '@/pages/TemplateDetailPage';
import { useSupabaseHash } from '../hooks/useSupabaseHash';

const AppRouter = () => {
  // Handle hash-based authentication redirects - now inside Router context
  useSupabaseHash();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/finish-signup" element={<FinishSignupPage />} />
      
      {/* OAuth callback routes */}
      <Route path="/oauth/whoop" element={<OAuthCallback />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      {/* Protected routes with billing gate */}
      <Route path="/" element={
        <ProtectedRoute>
          <ProtectAppGate>
            <AppLayout />
          </ProtectAppGate>
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="program" element={
          <ProtectedRoute roles={['solo']}>
            <SoloProgramPage />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="analytics/readiness" element={<ReadinessDetailPage />} />
        <Route path="analytics/sleep" element={<SleepDetailPage />} />
        <Route path="analytics/load" element={<LoadDetailPage />} />
        <Route path="athletes" element={
          <ProtectedRoute roles={['coach']}>
            <AthletesPage />
          </ProtectedRoute>
        } />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:threadId" element={<ChatPage />} />
        <Route path="risk-board" element={
          <ProtectedRoute roles={['coach']}>
            <RiskBoardPage />
          </ProtectedRoute>
        } />
        <Route path="training-programs" element={
          <ProtectedRoute roles={['coach']}>
            <TrainingPrograms />
          </ProtectedRoute>
        } />
        {/* Redirect old routes to new unified page */}
        <Route path="workouts" element={<Navigate to="/training-programs" replace />} />
        <Route path="workout" element={<Navigate to="/training-programs" replace />} />
        <Route path="training-objects" element={<Navigate to="/training-programs" replace />} />
        <Route path="kai" element={<Navigate to="/chat" replace />} />
        <Route path="template/:id" element={<TemplateDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="billing" element={<BillingEnhancedPage />} />
        <Route path="billing-enhanced" element={<BillingEnhancedPage />} />
      </Route>
      
      {/* Redirect root to home page for non-authenticated users */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

export default AppRouter;
