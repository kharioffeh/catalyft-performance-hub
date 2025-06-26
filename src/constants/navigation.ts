
import { LucideIcon, Users, BarChart3, Calendar, MessageSquare, Dumbbell, Settings, AlertTriangle, Target } from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: ('coach' | 'athlete' | 'solo')[];
}

export const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['coach', 'athlete', 'solo'],
  },
  {
    name: 'Program',
    href: '/program', 
    icon: Target,
    roles: ['solo'],
  },
  {
    name: 'Athletes',
    href: '/athletes',
    icon: Users,
    roles: ['coach'],
  },
  {
    name: 'Risk Board',
    href: '/risk-board',
    icon: AlertTriangle,
    roles: ['coach'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['coach', 'athlete', 'solo'],
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    roles: ['coach', 'athlete', 'solo'],
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
    roles: ['coach', 'athlete', 'solo'],
  },
  {
    name: 'Workouts',
    href: '/workouts',
    icon: Dumbbell,
    roles: ['coach'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['coach', 'athlete', 'solo'],
  },
];
