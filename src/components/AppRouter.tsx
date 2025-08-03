import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SkeletonCard } from './skeleton/SkeletonCard';
import { SkeletonBox } from './skeleton/SkeletonBox';
import AppLayout from './AppLayout';
import ProtectedRoute from './ProtectedRoute';
import { useSupabaseHash } from '../hooks/useSupabaseHash';

// Marketing and Core Pages
const LandingPage = React.lazy(() => import('../pages/Landing'));
const FeaturesPage = React.lazy(() => import('../pages/Features'));
const PricingPage = React.lazy(() => import('../pages/Pricing'));

// Auth Pages
const LoginPage = React.lazy(() => import('../pages/Login'));
const SignupPage = React.lazy(() => import('../pages/Signup'));
const ForgotPasswordPage = React.lazy(() => import('../pages/Auth'));
const ResetPasswordPage = React.lazy(() => import('../pages/Auth'));
const FinishSignupPage = React.lazy(() => import('../pages/FinishSignup'));
const OAuthCallback = React.lazy(() => import('../pages/OAuthCallback'));

// Account Management (Keep these for web)
const SettingsPage = React.lazy(() => import('../pages/SettingsRevamped'));
const SubscriptionsPage = React.lazy(() => import('../pages/Subscriptions'));
const ProfilePage = React.lazy(() => import('../pages/Profile'));

// Legal and Support
const PrivacyPolicyPage = React.lazy(() => import('../pages/PrivacyPolicy'));
const SupportPage = React.lazy(() => import('../pages/Support'));
const NotFoundPage = React.lazy(() => import('../pages/NotFound'));

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

/**
 * AppRouter handles routing for the marketing website and account management
 * 
 * This component now focuses on marketing pages and essential account functionality.
 * Full app functionality has been moved to the mobile platform.
 */
const AppRouter: React.FC = () => {
  console.log('🧭 AppRouter rendering marketing website routes...');
  // Handle hash-based authentication redirects
  useSupabaseHash();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Marketing Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/finish-signup" element={<FinishSignupPage />} />
        
        {/* OAuth callback routes */}
        <Route path="/oauth/whoop" element={<OAuthCallback />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        {/* Protected Account Management Routes */}
        <Route path="/account" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ProfilePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="subscription" element={<SubscriptionsPage />} />
          <Route path="billing" element={<SubscriptionsPage />} />
        </Route>
        
        {/* Redirect old app routes to landing page with mobile message */}
        <Route path="/dashboard" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/analytics" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/calendar" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/training*" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/nutrition*" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/sleep" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/workout*" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/programs*" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/feed" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/chat" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/library*" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/template*" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/instances" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/challenges" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/meets" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/clubs" element={<Navigate to="/?redirect=mobile" replace />} />
        <Route path="/mobile/*" element={<Navigate to="/?redirect=mobile" replace />} />
        
        {/* Legacy redirects for old routing structure */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/settings" element={<Navigate to="/account/settings" replace />} />
        <Route path="/subscriptions" element={<Navigate to="/account/subscription" replace />} />
        <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
        <Route path="/onboarding/*" element={<Navigate to="/?redirect=mobile" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
