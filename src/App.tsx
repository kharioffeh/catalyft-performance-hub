
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './components/AppRouter';
import { Toaster } from './components/ui/toaster';
import { GlassToastProvider } from './components/ui/GlassToastProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GlassToastProvider>
            <Toaster />
            <Router>
              <AppRouter />
            </Router>
          </GlassToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
