
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { TopBar } from '@/components/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { ResponsiveNavigation } from '@/components/navigation/ResponsiveNavigation';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole } from '@/config/routes';
import { cn } from '@/lib/utils';
import { ErrorFallback } from './ErrorFallback';
import { SafeAreaView } from '@/components/ui/SafeAreaView';

interface MainLayoutProps {
  variant: 'default' | 'dashboard' | 'analytics' | 'settings' | 'chat';
}

export const MainLayout: React.FC<MainLayoutProps> = ({ variant }) => {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Get navigation items based on user role
  const navigationItems = getNavigationForRole(profile?.role);

  return (
    <GlassLayout variant={variant}>
      <div className="min-h-screen flex w-full">
        {/* Responsive Navigation */}
        <ErrorBoundary FallbackComponent={({ error, resetErrorBoundary }) => (
          <div className="p-4 text-red-400 text-sm">
            Navigation error: {error.message}
            <button onClick={resetErrorBoundary} className="block mt-2 text-indigo-400">
              Retry
            </button>
          </div>
        )}>
          <ResponsiveNavigation />
        </ErrorBoundary>
        
        <div className={cn(
          "flex-1 flex flex-col min-w-0",
          // Add left margin on desktop to account for sidebar
          !isMobile ? "lg:ml-60" : ""
        )}>
          {!isMobile && (
            <ErrorBoundary FallbackComponent={({ error }) => (
              <div className="p-4 text-red-400 text-sm">TopBar error: {error.message}</div>
            )}>
              <TopBar />
            </ErrorBoundary>
          )}
          <main className={cn(
            "flex-1 overflow-auto scrollbar-hide",
            // Add top padding on mobile for navigation trigger
            isMobile ? "pt-16 pb-20" : "pt-4"
          )}>
            <SafeAreaView>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Outlet />
              </ErrorBoundary>
            </SafeAreaView>
          </main>
        </div>
      </div>
      
      {/* Bottom tab bar - only on mobile */}
      {isMobile && (
        <ErrorBoundary FallbackComponent={({ error }) => (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-100 text-red-600 text-sm">
            Bottom tab error: {error.message}
          </div>
        )}>
          <BottomTabBar />
        </ErrorBoundary>
      )}
    </GlassLayout>
  );
};
