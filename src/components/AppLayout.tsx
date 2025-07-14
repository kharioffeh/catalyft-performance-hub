
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useSupabaseHash } from '@/hooks/useSupabaseHash';
import { CommandPalette } from '@/components/CommandPalette';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/layout/ErrorFallback';
import { LoadingState } from '@/components/layout/LoadingState';
import { ProfileError } from '@/components/layout/ProfileError';
import { MainLayout } from '@/components/layout/MainLayout';

// Detect if current location is chat page
function isChatRoute(pathname: string) {
  return pathname.startsWith('/chat');
}

const AppLayout: React.FC = () => {
  const { user, profile, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        // Role-based default routing
        if (profile.role === 'coach') {
          console.log('Redirecting coach to athletes from:', currentPath);
          navigate('/athletes', { replace: true });
        } else {
          console.log('Redirecting solo user to dashboard from:', currentPath);
          navigate('/dashboard', { replace: true });
        }
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
    return <LoadingState variant={getLayoutVariant()} />;
  }

  // Not authenticated - ProtectedRoute will handle redirect
  if (!session) {
    console.log('AppLayout: No session');
    return null;
  }

  // Profile not found - show error with retry option
  if (!profile) {
    console.log('AppLayout: No profile found');
    return <ProfileError variant={getLayoutVariant()} />;
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
        <MainLayout variant={getLayoutVariant()} />
      </CommandPalette>
    </ErrorBoundary>
  );
};

export default AppLayout;
