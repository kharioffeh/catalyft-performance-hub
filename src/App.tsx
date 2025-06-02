
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
import RiskBoardPage from './pages/RiskBoard';
import TemplatesPage from './pages/TemplatesPage';
import TemplatePage from './pages/TemplatePage';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
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
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="template/:id" element={<TemplatePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
