
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, CreditCard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarDrawerProps {
  children?: React.ReactNode;
}

export const AvatarDrawer: React.FC<AvatarDrawerProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => handleNavigation('/settings'),
      show: true,
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard,
      onClick: () => handleNavigation('/subscriptions'),
      show: profile?.role === 'coach',
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      show: true,
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" className="p-0 h-auto">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 cursor-pointer">
              <AvatarFallback className={cn(
                "bg-white/70 dark:bg-gray-900/80",
                "text-gray-800 dark:text-white backdrop-blur-md",
                "border border-white/20 dark:border-white/10"
              )}>
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className={cn(
          "w-80 sm:max-w-sm",
          "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg",
          "border-l border-white/20 dark:border-white/10"
        )}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={cn(
                  "bg-white/70 dark:bg-gray-900/80",
                  "text-gray-800 dark:text-white backdrop-blur-md",
                  "border border-white/20 dark:border-white/10"
                )}>
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                  {profile?.full_name || 'User'}
                </span>
                {profile?.role && (
                  <span className="text-sm text-gray-500 dark:text-white/60 capitalize">
                    {profile.role}
                  </span>
                )}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-1 mt-6">
          {visibleItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === visibleItems.length - 1;
            
            return (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  onClick={item.onClick}
                  className={cn(
                    "w-full justify-start h-12 px-4",
                    "text-gray-700 dark:text-white/80",
                    "hover:bg-white/50 dark:hover:bg-gray-800/50",
                    "focus:bg-white/50 dark:focus:bg-gray-800/50",
                    "active:scale-95 transition-all duration-200",
                    item.id === 'logout' && "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-base font-medium">{item.label}</span>
                </Button>
                {!isLast && (
                  <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4 my-1" />
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
