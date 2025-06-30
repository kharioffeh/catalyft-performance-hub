
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { AvatarDrawer } from '@/components/layout/AvatarDrawer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { NotificationBell } from '@/components/NotificationBell';
import { useTimezoneDetection } from '@/hooks/useTimezoneDetection';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export const TopBar: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  // Initialize timezone detection
  useTimezoneDetection();

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-4 md:px-6",
      "bg-white/70 dark:bg-gray-900/80",
      "backdrop-blur-lg border-b border-white/20 dark:border-white/10",
      "shadow-glass-sm"
    )}>
      <div className="flex items-center space-x-4">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
          Catalyft AI
        </h1>
        {/* Show readiness badge on desktop only */}
        {!isMobile && <ReadinessBadge />}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Notification Bell */}
        <NotificationBell />
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {!isMobile && (
          <span className="text-sm text-gray-600 dark:text-white/80">
            {profile?.full_name || 'User'}
            {profile?.role && (
              <span className="ml-2 text-xs text-gray-500 dark:text-white/60 capitalize">
                ({profile.role})
              </span>
            )}
          </span>
        )}
        
        {/* Avatar Drawer */}
        <AvatarDrawer>
          <Avatar className="h-8 w-8 md:h-10 md:w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className={cn(
              "bg-white/70 dark:bg-gray-900/80",
              "text-gray-800 dark:text-white backdrop-blur-md",
              "border border-white/20 dark:border-white/10"
            )}>
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </AvatarDrawer>
      </div>
    </header>
  );
};
