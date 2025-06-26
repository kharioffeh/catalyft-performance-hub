
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { coachNavigation, soloNavigation } from '@/constants/navigation';

export const MobileNav: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  // Select navigation based on user role
  const navigationItems = profile?.role === 'coach' ? coachNavigation : soloNavigation;
  
  // Filter items that should be visible in mobile nav (all items for now)
  const visibleItems = navigationItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/20 backdrop-blur-md border-t border-white/20 shadow-2xl flex items-center justify-around z-50 safe-area-pb">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/analytics' && location.pathname.startsWith('/analytics'));
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 rounded-lg transition-all duration-200
              ${isActive 
                ? 'text-white bg-white/20 backdrop-blur-md shadow-lg' 
                : 'text-white/70 active:opacity-80 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
      
      <div className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1">
        <ReadinessBadge />
      </div>
    </div>
  );
};
