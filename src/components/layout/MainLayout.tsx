
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import Sidebar from '@/components/layout/Sidebar';
import { TopBar } from '@/components/TopBar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { GlassLayout } from '@/components/Glass/GlassLayout';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';
import { ErrorFallback } from './ErrorFallback';

interface MainLayoutProps {
  variant: 'default' | 'dashboard' | 'analytics' | 'settings' | 'chat';
}

export const MainLayout: React.FC<MainLayoutProps> = ({ variant }) => {
  const isMobile = useIsMobile();

  return (
    <GlassLayout variant={variant}>
      <div className="min-h-screen flex w-full">
        {/* Desktop sidebar - hidden on mobile */}
        {!isMobile && (
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
        )}
        
        <div className={cn(
          "flex-1 flex flex-col min-w-0",
          // Add bottom padding on mobile for tab bar
          isMobile ? "pb-16" : ""
        )}>
          {!isMobile && (
            <ErrorBoundary FallbackComponent={({ error }) => (
              <div className="p-4 text-red-400 text-sm">TopBar error: {error.message}</div>
            )}>
              <TopBar />
            </ErrorBoundary>
          )}
          <main className="flex-1 px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 overflow-auto">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
      
      {/* Bottom tab bar - only on mobile */}
      {isMobile && (
        <ErrorBoundary FallbackComponent={({ error }) => (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-red-100 text-red-600 text-sm">
            Tab bar error: {error.message}
          </div>
        )}>
          <BottomTabBar />
        </ErrorBoundary>
      )}
    </GlassLayout>
  );
};
