
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './components/AppRouter';
import { Toaster } from './components/ui/toaster';
import { GlassToastProvider } from './components/ui/GlassToastProvider';
import { RouteProgress } from './components/ui/RouteProgress';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppWithPerformanceMonitoring = () => {
  usePerformanceMonitor();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GlassToastProvider>
            <Toaster />
            <Router>
              <RouteProgress />
              <AppRouter />
            </Router>
          </GlassToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

function App() {
  return <AppWithPerformanceMonitoring />;
}

export default App;
