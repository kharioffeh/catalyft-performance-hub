
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { GlassToastProvider } from '@/components/ui/GlassToastProvider';
import { Toaster } from '@/components/ui/toaster';
import AppRouter from '@/components/AppRouter';

// Create QueryClient instance with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkoutProvider>
          <GlassToastProvider>
            <BrowserRouter>
              <div className="App">
                <Toaster />
                <AppRouter />
              </div>
            </BrowserRouter>
          </GlassToastProvider>
        </WorkoutProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
