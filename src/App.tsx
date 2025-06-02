import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import DashboardPage from './pages/DashboardPage';
import AthletesPage from './pages/AthletesPage';
import WorkoutsPage from './pages/WorkoutsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AppLayout from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import RiskBoardPage from './pages/RiskBoardPage';
import TemplatesPage from './pages/TemplatesPage';
import TemplatePage from './pages/TemplatePage';

function App() {
  return (
    <Router>
      <QueryClient>
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
      </QueryClient>
    </Router>
  );
}

export default App;
