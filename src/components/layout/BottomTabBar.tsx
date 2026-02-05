
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole } from '@/config/routes';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Get navigation items based on user role and take first 5 for bottom bar
  const navigationItems = getNavigationForRole(profile?.role);
  const tabItems: TabItem[] = navigationItems.slice(0, 5).map((item, index) => ({
    id: item.path.replace('/', '') || `tab-${index}`,
    label: item.label,
    icon: item.icon,
    path: item.path
  }));


  const isTabActive = (tabPath: string) => {
    if (tabPath === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(tabPath);
  };

  const handleTabPress = (path: string) => {
    navigate(path);
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-brand-charcoal/90 backdrop-blur-lg",
      "border-t border-white-12",
      "safe-area-pb"
    )} style={{ pointerEvents: 'auto' }}>
      <div className="flex justify-around items-center px-2 pt-2 pb-1" style={{ pointerEvents: 'auto' }}>
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          const isActive = isTabActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.path)}
              className={cn(
                // 48x48 dp touch target (48dp = ~18px at standard DPI)
                "flex flex-col items-center justify-center",
                "min-w-[48px] min-h-[48px] p-1",
                "rounded-lg transition-all duration-200",
                "touch-manipulation", // Optimizes for touch
                // Active state
                isActive 
                  ? "text-brand-blue" 
                  : "text-white-60",
                // Hover and focus states
                "hover:bg-white/10",
                "focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-opacity-50",
                // Active press feedback
                "active:scale-95 active:bg-white/20"
              )}
              aria-label={tab.label}
              role="tab"
              aria-selected={isActive}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 mb-0.5 transition-colors",
                  isActive 
                    ? "text-brand-blue" 
                    : "text-white-60"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive 
                  ? "text-brand-blue" 
                  : "text-white-60"
              )}>
                {tab.label}  
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
