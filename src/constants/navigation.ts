
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
    roles: ['coach', 'athlete', 'solo'],
  },
  {
    title: 'Program',
    href: '/program',
    icon: Activity,
    roles: ['solo'],
  },

  {
    title: 'Chat (KAI)',
    href: '/chat',
    icon: MessageSquare,
    roles: ['coach', 'athlete', 'solo'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['coach', 'athlete', 'solo'],
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
    label: 'Program',
    path: '/program',
    icon: Activity,
  },
  {
    label: 'Training Plan',
    path: '/training-plan',
    icon: BookOpen,
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
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
