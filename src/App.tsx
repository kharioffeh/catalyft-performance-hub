
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { GlassToastProvider } from '@/components/ui/GlassToastProvider';
import { Toaster } from '@/components/ui/toaster';
import AppRouter from '@/components/AppRouter';
// Temporarily remove security headers hook to test if it's causing issues
// import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';

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
  console.log('🚀 App component mounting...');
  // Temporarily disable security headers to test if they're causing issues
  // useSecurityHeaders();
  
  console.log('🎨 App component rendering...');
  
  // Add a simple loading indicator
  const [showFallback, setShowFallback] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000); // Show fallback after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  if (showFallback) {
    return (
      <div className="min-h-screen bg-brand-charcoal text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WorkoutProvider>
            <GlassToastProvider>
              <BrowserRouter>
                <div className="App bg-brand-charcoal min-h-screen">
                  <Toaster />
                  <AppRouter />
                </div>
              </BrowserRouter>
            </GlassToastProvider>
          </WorkoutProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
