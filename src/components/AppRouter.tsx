
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import Home from '@/pages/Home';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Athletes from '@/pages/Athletes';
import Calendar from '@/pages/Calendar';
import Templates from '@/pages/Templates';
import TemplatePage from '@/pages/TemplatePage';
import TemplateDetailPage from '@/pages/TemplateDetailPage';
import LibraryPage from '@/pages/LibraryPage';
import Chat from '@/pages/Chat';
import Analytics from '@/pages/Analytics';
import ReadinessDetailPage from '@/pages/ReadinessDetailPage';
import LoadDetailPage from '@/pages/LoadDetailPage';
import SleepDetailPage from '@/pages/SleepDetailPage';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import FinishSignup from '@/pages/FinishSignup';
import InviteComplete from '@/pages/InviteComplete';
import Settings from '@/pages/Settings';
import Workout from '@/pages/Workout';
import CoachRiskBoard from '@/pages/CoachRiskBoard';
import AthletesDebug from '@/pages/AthletesDebug';
import Privacy from '@/pages/Privacy';
import Subscription from '@/pages/Subscription';
import Subscriptions from '@/pages/Subscriptions';
import TemplatesPage from '@/pages/TemplatesPage';
import OAuthCallback from '@/pages/OAuthCallback';
import NotFound from '@/pages/NotFound';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Index /> : <Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/finish-signup" element={<FinishSignup />} />
      <Route path="/invite-complete" element={<InviteComplete />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/oauth/whoop" element={<OAuthCallback />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/athletes" element={<ProtectedRoute><AppLayout><Athletes /></AppLayout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><AppLayout><Calendar /></AppLayout></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><AppLayout><Templates /></AppLayout></ProtectedRoute>} />
      <Route path="/template/:id" element={<ProtectedRoute><AppLayout><TemplatePage /></AppLayout></ProtectedRoute>} />
      <Route path="/template-detail/:id" element={<ProtectedRoute><AppLayout><TemplateDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><AppLayout><LibraryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><AppLayout><Chat /></AppLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
      <Route path="/readiness" element={<ProtectedRoute><AppLayout><ReadinessDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/load" element={<ProtectedRoute><AppLayout><LoadDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/sleep" element={<ProtectedRoute><AppLayout><SleepDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/workout" element={<ProtectedRoute><AppLayout><Workout /></AppLayout></ProtectedRoute>} />
      <Route path="/risk-board" element={<ProtectedRoute><AppLayout><CoachRiskBoard /></AppLayout></ProtectedRoute>} />
      <Route path="/athletes-debug" element={<ProtectedRoute><AppLayout><AthletesDebug /></AppLayout></ProtectedRoute>} />
      <Route path="/subscription" element={<ProtectedRoute><AppLayout><Subscription /></AppLayout></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><AppLayout><Subscriptions /></AppLayout></ProtectedRoute>} />
      <Route path="/templates-page" element={<ProtectedRoute><AppLayout><TemplatesPage /></AppLayout></ProtectedRoute>} />

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
