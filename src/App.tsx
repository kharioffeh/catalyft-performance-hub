
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
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/athletes" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AthletesPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/risk-board" element={
                <ProtectedRoute>
                  <AppLayout>
                    <RiskBoardPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/workouts" element={
                <ProtectedRoute>
                  <AppLayout>
                    <WorkoutsPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/templates" element={
                <ProtectedRoute>
                  <AppLayout>
                    <TemplatesPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              <Route path="/template/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <TemplatePage />
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
