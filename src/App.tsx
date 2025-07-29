/**
 * Main App Component
 * 
 * This is the root component for the React web app.
 */

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/components/AppRouter';
import { initAmplitude, track } from '@/utils/amplitude';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const App: React.FC = () => {
  // Initialize Amplitude on app start
  useEffect(() => {
    initAmplitude();
    // Track app launch
    track('App Launched');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
