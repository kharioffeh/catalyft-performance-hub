
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { AvatarDrawer } from '@/components/layout/AvatarDrawer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { NotificationBell } from '@/components/NotificationBell';
import { useTimezoneDetection } from '@/hooks/useTimezoneDetection';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TopBar: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const { toggle } = useSidebarCollapse();
  
  // Initialize timezone detection
  useTimezoneDetection();

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-4 md:px-6",
      "bg-brand-charcoal/90",
      "backdrop-blur-lg border-b border-white-12",
      "shadow-glass-sm"
    )}>
      <div className="flex items-center space-x-4">
        <h1 className="text-lg md:text-xl font-display font-semibold text-brand-blue">
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
          <span className="text-sm text-white-90">
            {profile?.full_name || 'User'}
            {profile?.role && (
              <span className="ml-2 text-xs text-white-60 capitalize">
                ({profile.role})
              </span>
            )}
          </span>
        )}
        
        {/* Avatar Drawer */}
        <AvatarDrawer>
          <Avatar className="h-8 w-8 md:h-10 md:w-10 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className={cn(
              "bg-white/10 backdrop-blur-md",
              "text-white-90",
              "border border-white-12"
            )}>
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </AvatarDrawer>
      </div>
    </header>
  );
};
