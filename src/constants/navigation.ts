
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Settings, 
  BookOpen,
  Activity,
} from 'lucide-react';

// Legacy exports for backward compatibility
export const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Training Plan',
    href: '/training-plan',
    icon: Activity,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

// Solo-only navigation for clean experience
export const soloNavigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Training Plan',
    path: '/training-plan',
    icon: Activity,
  },
  {
    label: 'My Schedule',
    path: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Nutrition',
    path: '/nutrition/my-log',
    icon: BookOpen,
  },
  {
    label: 'Feed',
    path: '/feed',
    icon: MessageSquare,
  },
  {
    label: 'Chat',
    path: '/chat',
    icon: MessageSquare,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

// Remove duplicate - already defined above
