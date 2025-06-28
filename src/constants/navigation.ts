
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
    title: 'Workouts',
    href: '/workouts',
    icon: Dumbbell,
    roles: ['coach'],
  },
  {
    title: 'Training Objects',
    href: '/training-objects',
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
