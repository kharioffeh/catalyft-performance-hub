
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { TopBar } from '@/components/TopBar';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useSupabaseHash } from '@/hooks/useSupabaseHash';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
      
      // Redirect from root paths to appropriate dashboard
      if (currentPath === '/' || currentPath === '/home') {
        if (profile.role === 'coach') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [profile, loading, session, navigate, location.pathname]);

  // Get layout variant based on current page
  const getLayoutVariant = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path === '/settings' || path === '/subscriptions') return 'settings';
    return 'default';
  };

  if (loading) {
    return (
      <GlassLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50 mx-auto"></div>
            <p className="mt-4 text-white/70">Loading your account...</p>
          </div>
        </div>
      </GlassLayout>
    );
  }

  if (!session) {
    return null; // ProtectedRoute will handle redirect
  }

  if (!profile) {
    return (
      <GlassLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Profile Not Found</h3>
              <p className="text-white/70 mb-4">
                We couldn't find your profile. Please try refreshing or contact support.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white backdrop-blur-md"
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

  return (
    <GlassLayout variant={getLayoutVariant()}>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 flex-shrink-0">
            <div className="fixed top-0 left-0 w-64 h-full">
              <Sidebar />
            </div>
          </div>
        )}
        
        <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'pb-16' : ''}`}>
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        
        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
      </div>
    </GlassLayout>
  );
};

export default AppLayout;
