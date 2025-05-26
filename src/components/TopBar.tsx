
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export const TopBar: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Catalyft AI
        </h1>
        <ReadinessBadge />
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {profile?.full_name || 'User'}
        </span>
        <Avatar>
          <AvatarFallback>
            {profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button variant="outline" onClick={signOut} size="sm">
          Sign Out
        </Button>
      </div>
    </header>
  );
};
