
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

// Detect if current location is chat page
function isChatRoute(pathname: string) {
  return pathname.startsWith('/chat');
}

const AppLayout: React.FC = () => {
  const { user, profile, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Use global hash handler
  useSupabaseHash();

  // Handle role-based redirects
  useEffect(() => {
    if (!loading && session && profile) {
      const currentPath = location.pathname;
      if (currentPath === '/' || currentPath === '/home') {
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

  const isDarkTheme = isChatRoute(location.pathname);

  // Loading state - show spinner while authentication is loading
  if (loading) {
    return (
      <GlassLayout variant={getLayoutVariant()}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading your account...</p>
          </div>
        </div>
      </GlassLayout>
    );
  }

  // Not authenticated - ProtectedRoute will handle redirect
  if (!session) {
    return null;
  }

  // Profile not found - show error with retry option
  if (!profile) {
    return (
      <GlassLayout variant={getLayoutVariant()}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className={`rounded-2xl ${isDarkTheme ? "bg-black/40 border border-gray-900/50" : "bg-white/10 border border-white/20"} backdrop-blur-md shadow-xl p-6`}>
              <AlertCircle className={`h-8 w-8 mx-auto mb-4 ${isDarkTheme ? "text-accent" : "text-red-400"}`} />
              <h3 className="text-lg font-semibold text-white mb-2">Profile Not Found</h3>
              <p className="text-white/70 mb-4">
                We couldn't find your profile. Please try refreshing or contact support.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className={`${isDarkTheme ? "bg-accent hover:bg-accent/80 border border-gray-900/80" : "bg-white/20 hover:bg-white/30 border border-white/30"} text-white backdrop-blur-md`}
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
    navigate('/onboarding/role', { replace: true });
    return null;
  }

  return (
    <GlassLayout variant={getLayoutVariant()}>
      <div className="min-h-screen flex w-full">
        {/* New unified sidebar for both mobile and desktop */}
        <Sidebar />
        
        <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pt-14' : ''}`}>
          {!isMobile && <TopBar />}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </GlassLayout>
  );
};

export default AppLayout;
