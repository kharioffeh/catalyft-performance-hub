
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
    "bg-brand-charcoal/95 backdrop-blur-lg",
    "border-white-12"
  );

  const activeBg = cn(
    "bg-brand-blue/20 text-brand-blue font-semibold",
    "border-l-2 border-brand-blue shadow-glass-sm"
  );
  
  const inactiveText = cn(
    "text-white-60",
    "hover:bg-white/10",
    "hover:text-white-90"
  );

  const borderColor = "border-white-12";

  return (
    <aside className={cn(
      "flex h-screen flex-col shadow-glass-md transition-all duration-300",
      desktopBg,
      "border-r",
      isCollapsed ? "w-16" : "w-60"
    )}>
      <div className={cn(
        "flex items-center justify-center py-6 text-xl font-semibold text-brand-blue transition-all duration-300",
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
