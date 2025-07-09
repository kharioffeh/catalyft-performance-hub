
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Dumbbell,
  BookOpen,
  AlertTriangle,
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
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['coach', 'athlete'],
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    roles: ['coach', 'athlete'],
  },
  {
    title: 'Athletes',
    href: '/athletes',
    icon: Users,
    roles: ['coach'],
  },
  {
    title: 'Risk Board',
    href: '/risk-board',
    icon: AlertTriangle,
    roles: ['coach'],
  },
  {
    title: 'Training',
    href: '/training-programs',
    icon: BookOpen,
    roles: ['coach'],
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

// Role-specific navigation arrays for backward compatibility
export const coachNavigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: Calendar,
  },
  {
    label: 'Athletes',
    path: '/athletes',
    icon: Users,
  },
  {
    label: 'Risk Board',
    path: '/risk-board',
    icon: AlertTriangle,
  },
  {
    label: 'Training',
    path: '/training-programs',
    icon: BookOpen,
  },
  {
    label: 'Chat',
    path: '/chat',
    icon: MessageSquare,
  },
];

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
    label: 'Chat',
    path: '/chat',
    icon: MessageSquare,
  },
];
