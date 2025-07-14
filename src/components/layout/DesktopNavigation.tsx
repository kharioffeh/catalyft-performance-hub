
import React from 'react';
import { cn } from '@/lib/utils';
import { NavigationList } from './NavigationList';
import { UserProfile } from './UserProfile';
import { useSidebarCollapse } from '@/hooks/useSidebarCollapse';

interface DesktopNavigationProps {
  navigationItems: any[];
  profile: any;
  navigate: (path: string) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navigationItems,
  profile,
  navigate,
}) => {
  const { isCollapsed } = useSidebarCollapse();

  const desktopBg = cn(
    "bg-gradient-to-b from-surface-light/90 to-surface-light/80",
    "dark:from-surface-dark/90 dark:to-surface-dark/80",
    "border-white/20 dark:border-white/10"
  );

  const activeBg = cn(
    "bg-theme-accent/20 text-gray-800 dark:text-white font-semibold",
    "border border-theme-accent/30 shadow-glass-sm"
  );
  
  const inactiveText = cn(
    "text-gray-700 dark:text-white/80",
    "hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30",
    "hover:text-gray-900 dark:hover:text-white"
  );

  const borderColor = "border-white/20 dark:border-white/10";

  return (
    <aside className={cn(
      "hidden lg:flex lg:h-screen lg:flex-col shadow-glass-md transition-all duration-300",
      desktopBg,
      "border-r",
      isCollapsed ? "lg:w-16" : "lg:w-60"
    )}>
      <div className={cn(
        "flex items-center justify-center py-6 text-xl font-semibold text-gray-800 dark:text-white transition-all duration-300",
        isCollapsed ? "px-2" : "px-6"
      )}>
        {isCollapsed ? "C" : "Catalyft"}
      </div>
      <NavigationList 
        navigationItems={navigationItems} 
        activeBg={activeBg} 
        inactiveText={inactiveText}
        isCollapsed={isCollapsed}
      />
      <UserProfile 
        borderColor={borderColor} 
        inactiveText={inactiveText}
        profile={profile}
        navigate={navigate}
        isCollapsed={isCollapsed}
      />
    </aside>
  );
};
