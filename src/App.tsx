import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import FinishSignup from '@/pages/FinishSignup';
import InviteComplete from '@/pages/InviteComplete';
import Privacy from '@/pages/Privacy';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import CoachBoard from '@/pages/CoachBoard';
import Calendar from '@/pages/Calendar';
import Athletes from '@/pages/Athletes';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';
import Subscription from '@/pages/Subscription';
import Subscriptions from '@/pages/Subscriptions';
import CoachRiskBoard from '@/pages/CoachRiskBoard';
import Workout from '@/pages/Workout';
import NotFound from '@/pages/NotFound';
import Templates from '@/pages/Templates';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/finish-signup" element={<FinishSignup />} />
            <Route path="/invite-complete/:token" element={<InviteComplete />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/coach" element={<CoachBoard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/athletes" element={<Athletes />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/coach/risk" element={<CoachRiskBoard />} />
                <Route path="/workout" element={<Workout />} />
                <Route path="/templates" element={<Templates />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
