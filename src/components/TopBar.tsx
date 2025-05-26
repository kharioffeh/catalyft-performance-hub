
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useBreakpoint';

export const TopBar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Catalyft AI
        </h1>
        {/* Show readiness badge on desktop only */}
        {!isMobile && <ReadinessBadge />}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {!isMobile && (
          <span className="text-sm text-gray-600">
            {profile?.full_name || 'User'}
          </span>
        )}
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarFallback className="text-sm">
            {profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button 
          variant="outline" 
          onClick={signOut} 
          size="sm"
          className="min-h-[44px] md:min-h-auto active:opacity-80"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
};
