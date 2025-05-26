
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Activity, 
  ShieldAlert, 
  CalendarClock, 
  Dumbbell, 
  BrainCircuit, 
  Settings2, 
  CreditCard,
  Users
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: Activity,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/coach',
    label: 'Risk Board',
    icon: ShieldAlert,
    visibleTo: ['coach']
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
    label: 'Ask My Data',
    icon: BrainCircuit,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/athletes',
    label: 'Athletes',
    icon: Users,
    visibleTo: ['coach']
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings2,
    visibleTo: ['athlete', 'coach']
  },
  {
    path: '/subscriptions',
    label: 'Billing',
    icon: CreditCard,
    visibleTo: ['coach']
  }
];

export const Sidebar: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const visibleItems = navigationItems.filter(item => 
    item.visibleTo.includes(profile?.role || 'athlete')
  );

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-screen w-20 bg-[#131313] flex flex-col items-center py-6 z-50">
        <div className="mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#131313] font-bold text-xl">C</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col space-y-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200
                      ${isActive 
                        ? 'bg-white text-[#131313] shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon size={20} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
};
