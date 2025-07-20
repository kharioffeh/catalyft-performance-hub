
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { TopBar } from '@/components/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { DesktopNavigation } from '@/components/layout/DesktopNavigation';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { SidebarProvider } from '@/contexts/SidebarContext';
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

  // Get navigation items based on user role
  const navigationItems = getNavigationForRole(profile?.role);

  return (
    <SidebarProvider>
      <GlassLayout variant={variant}>
        <div className="min-h-screen flex w-full">
          {/* Desktop Navigation - Always visible on desktop */}
          {!isMobile && (
            <ErrorBoundary FallbackComponent={({ error, resetErrorBoundary }) => (
              <div className="p-4 text-red-400 text-sm">
                Navigation error: {error.message}
                <button onClick={resetErrorBoundary} className="block mt-2 text-indigo-400">
                  Retry
                </button>
              </div>
            )}>
              <DesktopNavigation 
                navigationItems={navigationItems}
                profile={profile}
                navigate={navigate}
              />
            </ErrorBoundary>
          )}

          {/* Mobile Navigation - Header with drawer */}
          {isMobile && (
            <ErrorBoundary FallbackComponent={({ error, resetErrorBoundary }) => (
              <div className="p-4 text-red-400 text-sm">
                Navigation error: {error.message}
                <button onClick={resetErrorBoundary} className="block mt-2 text-indigo-400">
                  Retry
                </button>
              </div>
            )}>
              <MobileNavigation 
                navigationItems={navigationItems}
                profile={profile}
                navigate={navigate}
              />
            </ErrorBoundary>
          )}
          
          <div className="flex-1 flex flex-col min-w-0 w-full">
            {/* TopBar - only show on desktop since mobile has its own header */}
            {!isMobile && (
              <ErrorBoundary FallbackComponent={({ error }) => (
                <div className="p-4 text-red-400 text-sm">TopBar error: {error.message}</div>
              )}>
                <TopBar />
              </ErrorBoundary>
            )}
            
            <main className={cn(
              "flex-1 overflow-auto scrollbar-hide",
              // Add top padding on mobile for mobile header, bottom padding for bottom navigation
              // Add top padding on desktop for TopBar
              isMobile ? "pt-14 pb-20" : "pt-4"
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
    </SidebarProvider>
  );
};
