
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  borderColor: string;
  inactiveText: string;
  profile: any;
  navigate: (path: string) => void;
  isCollapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  borderColor,
  inactiveText,
  profile,
  navigate,
  isCollapsed = false,
}) => {
  return (
    <div className={cn("mt-auto px-3 py-3 border-t", borderColor)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
            "w-full h-auto py-2 transition-all duration-300",
            isCollapsed ? "justify-center px-2" : "justify-start px-2",
            inactiveText,
            "hover:text-gray-900 dark:hover:text-white"
          )}>
            <Avatar className={cn(
              "w-8 h-8 flex-shrink-0",
              isCollapsed ? "" : "mr-3"
            )}>
              <AvatarImage src="" />
              <AvatarFallback className={cn(
                "bg-glass-card-light/60 dark:bg-glass-card-dark/80",
                "border border-white/20 dark:border-white/10",
                "text-gray-800 dark:text-white backdrop-blur-md"
              )}>
                {profile?.full_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col text-left truncate min-w-0">
                <span className="text-sm font-medium truncate">{profile?.full_name}</span>
                <span className="text-xs text-gray-500 dark:text-white/60 truncate">{profile?.email}</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={cn(
            "w-56 shadow-glass-lg",
            "bg-glass-card-light/90 dark:bg-glass-card-dark/90",
            "border border-white/20 dark:border-white/10 backdrop-blur-md"
          )} 
          align="end" 
          forceMount
        >
          <DropdownMenuLabel className="text-gray-800 dark:text-white">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className={borderColor} />
          <DropdownMenuItem 
            onClick={() => navigate('/settings')}
            className="text-gray-700 dark:text-white/80 hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30 hover:text-gray-900 dark:hover:text-white focus:bg-glass-card-light/60 dark:focus:bg-glass-card-dark/30 focus:text-gray-900 dark:focus:text-white"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/subscriptions')}
            className="text-gray-700 dark:text-white/80 hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30 hover:text-gray-900 dark:hover:text-white focus:bg-glass-card-light/60 dark:focus:bg-glass-card-dark/30 focus:text-gray-900 dark:focus:text-white"
          >
            Subscription
          </DropdownMenuItem>
          <DropdownMenuSeparator className={borderColor} />
          <DropdownMenuItem 
            onClick={() => {
              supabase.auth.signOut();
              navigate('/login');
            }}
            className="text-gray-700 dark:text-white/80 hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30 hover:text-gray-900 dark:hover:text-white focus:bg-glass-card-light/60 dark:focus:bg-glass-card-dark/30 focus:text-gray-900 dark:focus:text-white"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
