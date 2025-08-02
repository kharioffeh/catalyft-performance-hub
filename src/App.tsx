/**
 * Main App Component
 * 
 * This is the root component for the React web app.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import AppRouter from '@/components/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnalyticsProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
