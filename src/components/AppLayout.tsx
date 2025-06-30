
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import { TopBar } from '@/components/TopBar';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useSupabaseHash } from '@/hooks/useSupabaseHash';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SkeletonBox } from '@/components/skeleton/SkeletonBox';
import { CommandPalette } from '@/components/CommandPalette';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  console.error('AppLayout Error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full text-center">
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-white/70 mb-4 text-sm">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button 
            onClick={resetErrorBoundary} 
            className="bg-indigo-500/90 hover:bg-indigo-500 text-white backdrop-blur-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

// Detect if current location is chat page
function isChatRoute(pathname: string) {
  return pathname.startsWith('/chat');
}

const AppLayout: React.FC = () => {
  const { user, profile, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Debug logging
  console.log('AppLayout render:', { 
    user: !!user, 
    profile: !!profile, 
    loading, 
    session: !!session,
    pathname: location.pathname 
  });

  // Use global hash handler
  useSupabaseHash();

  // Handle role-based redirects
  useEffect(() => {
    if (!loading && session && profile) {
      const currentPath = location.pathname;
      if (currentPath === '/' || currentPath === '/home') {
        console.log('Redirecting to dashboard from:', currentPath);
        navigate('/dashboard', { replace: true });
      }
    }
  }, [profile, loading, session, navigate, location.pathname]);

  // Get layout variant based on current page
  const getLayoutVariant = () => {
    if (isChatRoute(location.pathname)) return 'chat';
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path === '/settings' || path === '/subscriptions') return 'settings';
    return 'default';
  };

  // Loading state - show skeleton instead of spinner
  if (loading) {
    console.log('AppLayout: Loading state');
    return (
      <GlassLayout variant={getLayoutVariant()}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <SkeletonBox width={200} height={48} className="mx-auto" />
            <SkeletonBox width={160} height={16} className="mx-auto" />
          </div>
        </div>
      </GlassLayout>
    );
  }

  // Not authenticated - ProtectedRoute will handle redirect
  if (!session) {
    console.log('AppLayout: No session');
    return null;
  }

  // Profile not found - show error with retry option
  if (!profile) {
    console.log('AppLayout: No profile found');
    return (
      <GlassLayout variant={getLayoutVariant()}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold text-white mb-2">Profile Not Found</h3>
              <p className="text-white/70 mb-4">
                We couldn't find your profile. Please try refreshing or contact support.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-indigo-500/90 hover:bg-indigo-500 text-white backdrop-blur-md"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </GlassLayout>
    );
  }

  // Role validation - redirect to onboarding if role is missing
  if (!profile.role) {
    console.log('AppLayout: No role, redirecting to onboarding');
    navigate('/onboarding/role', { replace: true });
    return null;
  }

  console.log('AppLayout: Rendering main layout');

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CommandPalette>
        <GlassLayout variant={getLayoutVariant()}>
          <div className="min-h-screen flex w-full">
            {/* New unified sidebar for both mobile and desktop */}
            <ErrorBoundary FallbackComponent={({ error, resetErrorBoundary }) => (
              <div className="p-4 text-red-400 text-sm">
                Sidebar error: {error.message}
                <button onClick={resetErrorBoundary} className="block mt-2 text-indigo-400">
                  Retry
                </button>
              </div>
            )}>
              <Sidebar />
            </ErrorBoundary>
            
            <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pt-14' : ''}`}>
              {!isMobile && (
                <ErrorBoundary FallbackComponent={({ error }) => (
                  <div className="p-4 text-red-400 text-sm">TopBar error: {error.message}</div>
                )}>
                  <TopBar />
                </ErrorBoundary>
              )}
              <main className="flex-1 p-4 md:p-6 overflow-auto">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Outlet />
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </GlassLayout>
      </CommandPalette>
    </ErrorBoundary>
  );
};

export default AppLayout;
