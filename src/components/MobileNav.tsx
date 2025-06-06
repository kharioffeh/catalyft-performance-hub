
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessBadge } from '@/components/ReadinessBadge';
import { 
  Activity, 
  CalendarClock, 
  Dumbbell, 
  BrainCircuit, 
  Settings2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: Activity,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: TrendingUp,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/calendar',
    label: 'Calendar',
    icon: CalendarClock,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/workout',
    label: 'Workouts',
    icon: Dumbbell,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/chat',
    label: 'Chat',
    icon: BrainCircuit,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/risk-board',
    label: 'Risk',
    icon: AlertTriangle,
    visibleTo: ['coach']
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings2,
    visibleTo: ['athlete', 'coach']
  }
];

export const MobileNav: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const visibleItems = navigationItems.filter(item => 
    item.visibleTo.includes(profile?.role || 'athlete')
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#131313] border-t border-gray-800 flex items-center justify-around z-50 safe-area-pb">
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
                ? 'text-white bg-gray-700' 
                : 'text-gray-400 active:opacity-80'
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
