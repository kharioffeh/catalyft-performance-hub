import React, { useRef, useEffect } from 'react';
import { Menu as MenuIcon, X as XIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { cn } from '@/lib/utils';
import { NavigationList } from './NavigationList';
import { UserProfile } from './UserProfile';
import { useMobileDrawerCollapse } from '@/hooks/useMobileDrawerCollapse';

interface MobileDrawerProps {
  navigationItems: any[];
  profile: any;
  navigate: (path: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  navigationItems,
  profile,
  navigate,
  isOpen,
  onToggle,
}) => {
  const { isCollapsed, toggle: toggleCollapse } = useMobileDrawerCollapse();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!isOpen) {
        onToggle();
      }
    },
    onSwipedLeft: () => {
      if (isOpen) {
        onToggle();
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // Edge swipe detection for opening drawer
  const edgeSwipeHandlers = useSwipeable({
    onSwipedRight: (eventData) => {
      // Only trigger if swipe starts from the left edge (first 20px)
      if (eventData.initial[0] <= 20 && !isOpen) {
        onToggle();
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const drawerWidth = isCollapsed ? 80 : 240;
  
  const headerBg = cn(
    "bg-glass-card-light/40 dark:bg-glass-card-dark/60",
    "backdrop-blur-lg border-white/20 dark:border-white/10"
  );
  
  const drawerBg = cn(
    "bg-gradient-to-b from-surface-light/90 to-surface-light/80",
    "dark:from-surface-dark/90 dark:to-surface-dark/80"
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
    <>
      {/* Header with hamburger menu */}
      <div className={cn(
        "fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 lg:hidden",
        headerBg,
        "border-b"
      )}>
        <span className={cn(
          "font-semibold tracking-tight text-gray-800 dark:text-white transition-all duration-300",
          isCollapsed && isOpen ? "opacity-0" : "opacity-100"
        )}>
          Catalyft
        </span>
        <div className="flex items-center gap-2">
          {/* Collapse toggle button - only show when drawer is open */}
          {isOpen && (
            <button
              onClick={toggleCollapse}
              className={cn(
                "rounded-md p-2 transition-colors",
                "text-gray-700 dark:text-white/80",
                "hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/60",
                "focus:outline-none"
              )}
              title={isCollapsed ? "Expand drawer" : "Collapse drawer"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          )}
          
          {/* Menu toggle button */}
          <button
            onClick={onToggle}
            className={cn(
              "rounded-md p-2 transition-colors",
              "text-gray-700 dark:text-white/80",
              "hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/60",
              "focus:outline-none"
            )}
          >
            {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Gesture area for edge swipe when drawer is closed */}
      {!isOpen && (
        <div
          {...edgeSwipeHandlers}
          className="fixed left-0 top-0 bottom-0 w-5 z-25 lg:hidden"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        {...swipeHandlers}
        style={{
          width: `${drawerWidth}px`,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-35 overflow-y-auto pt-16 shadow-glass-lg lg:hidden transition-transform duration-300 ease-in-out",
          drawerBg
        )}
      >
        <NavigationList 
          navigationItems={navigationItems} 
          activeBg={activeBg} 
          inactiveText={inactiveText}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && (
          <UserProfile 
            borderColor={borderColor} 
            inactiveText={inactiveText}
            profile={profile}
            navigate={navigate}
          />
        )}
      </div>
    </>
  );
};