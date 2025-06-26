
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useBreakpoint';

// Accept isDarkTheme prop
export const TopBar: React.FC<{ isDarkTheme?: boolean }> = ({ isDarkTheme = false }) => {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  // glass class based on theme
  const glass = isDarkTheme
    ? "bg-black/40 backdrop-blur-lg border-b border-gray-900/60 shadow-xl"
    : "bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg";

  return (
    <header className={`h-16 ${glass} flex items-center justify-between px-4 md:px-6`}>
      <div className="flex items-center space-x-4">
        <h1 className="text-lg md:text-xl font-semibold text-white">
          Catalyft AI
        </h1>
        {/* Show readiness badge on desktop only */}
        {!isMobile && <ReadinessBadge />}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {!isMobile && (
          <span className="text-sm text-white/80">
            {profile?.full_name || 'User'}
            {profile?.role && (
              <span className="ml-2 text-xs text-white/60 capitalize">
                ({profile.role})
              </span>
            )}
          </span>
        )}
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarFallback className="bg-white/20 text-white backdrop-blur-md">
            {profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button 
          variant="outline" 
          onClick={signOut} 
          size="sm"
          className={`min-h-[44px] md:min-h-auto active:opacity-80 ${isDarkTheme ? "bg-black/30 hover:bg-black/50 border-gray-900/40" : "bg-white/20 hover:bg-white/30 border-white/30"} text-white backdrop-blur-md`}
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
};
