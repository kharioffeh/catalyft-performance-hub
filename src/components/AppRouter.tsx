import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SkeletonCard } from './skeleton/SkeletonCard';
import { SkeletonBox } from './skeleton/SkeletonBox';
import AppLayout from './AppLayout';
import ProtectedRoute from './ProtectedRoute';
import ProtectAppGate from './ProtectAppGate';
import { useSupabaseHash } from '../hooks/useSupabaseHash';

// Lazy load all pages for better code splitting
const DashboardPage = React.lazy(() => import('../pages/Dashboard'));
const AnalyticsPage = React.lazy(() => import('../pages/Analytics'));
const ReadinessDetailPage = React.lazy(() => import('../pages/ReadinessDetailPage'));

const LoadDetailPage = React.lazy(() => import('../pages/LoadDetailPage'));

const TrainingPrograms = React.lazy(() => import('../pages/TrainingPrograms'));
const SettingsPage = React.lazy(() => import('../pages/SettingsRevamped'));
const SubscriptionsPage = React.lazy(() => import('../pages/Subscriptions'));
// const BillingEnhancedPage = React.lazy(() => import('../pages/BillingEnhanced'));
const LoginPage = React.lazy(() => import('../pages/Login'));
const SignupPage = React.lazy(() => import('../pages/Signup'));
const ForgotPasswordPage = React.lazy(() => import('../pages/Auth'));
const ResetPasswordPage = React.lazy(() => import('../pages/Auth'));
const FinishSignupPage = React.lazy(() => import('../pages/FinishSignup'));
const CalendarPage = React.lazy(() => import('../pages/Calendar'));
const ChatPage = React.lazy(() => import('../pages/Chat').then(module => ({ default: module.Chat })));
const HomePage = React.lazy(() => import('../pages/Home'));
const PrivacyPolicyPage = React.lazy(() => import('../pages/PrivacyPolicy'));
const OAuthCallback = React.lazy(() => import('../pages/OAuthCallback'));
const SoloWizard = React.lazy(() => import('../pages/onboarding/SoloWizard').then(module => ({ default: module.SoloWizard })));
const SoloProgramPage = React.lazy(() => import('../pages/solo/ProgramPage'));
const TemplateDetailPage = React.lazy(() => import('@/pages/TemplateDetailPage'));
const TrainingPlan = React.lazy(() => import('@/pages/TrainingPlan'));

const NutritionPage = React.lazy(() => import('../pages/Nutrition'));
const MealParseScreen = React.lazy(() => import('../components/nutrition/MealParseScreen'));
const SleepPage = React.lazy(() => import('../pages/Sleep'));
const StressDetailPage = React.lazy(() => import('../pages/StressDetailPage'));
const LiveSessionPage = React.lazy(() => import('../pages/LiveSession'));
const ProfilePage = React.lazy(() => import('../pages/Profile'));
const FeedPage = React.lazy(() => import('../pages/Feed'));
const LogWorkoutScreen = React.lazy(() => import('../pages/mobile/LogWorkoutScreen'));
const CalendarScreen = React.lazy(() => import('../pages/mobile/CalendarScreen').then(module => ({ default: module.CalendarScreen })));
const SorenessScreen = React.lazy(() => import('../pages/mobile/SorenessScreen').then(module => ({ default: module.SorenessScreen })));
const ProgramBuilderScreen = React.lazy(() => import('../pages/mobile/ProgramBuilderScreen').then(module => ({ default: module.ProgramBuilderScreen })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md">
      <SkeletonBox width="100%" height={40} />
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-32" />
    </div>
  </div>
);

const AppRouter = () => {
  // Handle hash-based authentication redirects - now inside Router context
  useSupabaseHash();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/finish-signup" element={<FinishSignupPage />} />
        
        {/* Onboarding routes */}
        <Route path="/onboarding/solo" element={<SoloWizard />} />
        
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
          <Route path="profile" element={<ProfilePage />} />
          <Route path="program" element={
            <ProtectedRoute roles={['solo']}>
              <SoloProgramPage />
            </ProtectedRoute>
          } />
          <Route path="training" element={<Navigate to="/training-plan" replace />} />
          <Route path="training/live" element={<LiveSessionPage />} />
          <Route path="training/log-workout" element={<LogWorkoutScreen />} />
          <Route path="mobile/calendar" element={<CalendarScreen />} />
          <Route path="mobile/soreness" element={<SorenessScreen />} />
          <Route path="mobile/program-builder" element={<ProgramBuilderScreen />} />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="nutrition/parse" element={<MealParseScreen />} />
          <Route path="sleep" element={<Navigate to="/analytics" replace />} />
          <Route path="stress" element={<Navigate to="/analytics" replace />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="analytics/readiness" element={<Navigate to="/analytics" replace />} />
          <Route path="analytics/sleep" element={<Navigate to="/analytics" replace />} />
          <Route path="analytics/load" element={<Navigate to="/analytics" replace />} />

          <Route path="calendar" element={<CalendarPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:threadId" element={<ChatPage />} />

          <Route path="training-programs" element={<Navigate to="/training-plan" replace />} />
          <Route path="training-plan/*" element={<TrainingPlan />} />
          {/* Redirect old routes to new unified page */}
          <Route path="workouts" element={<Navigate to="/training-plan" replace />} />
          <Route path="workout" element={<Navigate to="/training-plan" replace />} />
          <Route path="training-objects" element={<Navigate to="/training-plan" replace />} />
          <Route path="kai" element={<Navigate to="/chat" replace />} />
          <Route path="template/:id" element={<TemplateDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="billing" element={<SubscriptionsPage />} />
          <Route path="billing-enhanced" element={<SubscriptionsPage />} />
        </Route>
        
        {/* Redirect root to home page for non-authenticated users */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
