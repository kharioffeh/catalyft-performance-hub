
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  AlertTriangle,
  Dumbbell,
  TrendingUp
} from 'lucide-react';

export type NavItem = {
  label: string;
  path: string;
  icon: typeof BarChart3;
  visibleTo?: string[];
};

export const coachNavigation: NavItem[] = [
  { 
    label: 'Dashboard', 
    path: '/dashboard',
    icon: BarChart3
  },
  { 
    label: 'Analytics', 
    path: '/analytics',
    icon: TrendingUp
  },
  { 
    label: 'Athletes', 
    path: '/athletes',
    icon: Users
  },
  { 
    label: 'Calendar', 
    path: '/calendar',
    icon: Calendar
  },
  { 
    label: 'ARIA', 
    path: '/chat',
    icon: MessageSquare
  },
  { 
    label: 'Workouts', 
    path: '/workout',
    icon: Dumbbell
  },
  { 
    label: 'Risk Board', 
    path: '/risk-board',
    icon: AlertTriangle
  },
  { 
    label: 'Settings', 
    path: '/settings',
    icon: Settings
  },
];

export const soloNavigation: NavItem[] = [
  { 
    label: 'Dashboard', 
    path: '/dashboard',
    icon: BarChart3
  },
  { 
    label: 'Analytics', 
    path: '/analytics',
    icon: TrendingUp
  },
  { 
    label: 'Calendar', 
    path: '/calendar',
    icon: Calendar
  },
  { 
    label: 'ARIA', 
    path: '/chat',
    icon: MessageSquare
  },
  { 
    label: 'Workouts', 
    path: '/workout',
    icon: Dumbbell
  },
  { 
    label: 'Settings', 
    path: '/settings',
    icon: Settings
  },
];

// Legacy support for mobile nav format
export const mobileCoachNavigation = coachNavigation.map(item => ({
  ...item,
  visibleTo: ['coach']
}));

export const mobileSoloNavigation = soloNavigation.map(item => ({
  ...item,
  visibleTo: ['athlete']
}));
