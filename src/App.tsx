
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CommandPalette } from './components/CommandPalette';
import AppRouter from './components/AppRouter';
import { Toaster } from './components/ui/toaster';
import { GlassToastProvider } from './components/ui/GlassToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CommandPalette>
            <GlassToastProvider>
              <Toaster />
              <Router>
                <AppRouter />
              </Router>
            </GlassToastProvider>
          </CommandPalette>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
