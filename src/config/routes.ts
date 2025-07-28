export type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: ("solo")[];
  children?: NavItem[];
};

import {
  BarChart3, Calendar, MessageSquare, 
  Settings, BookOpen, Activity, Target, Users
} from "lucide-react";

export const NAV_ROUTES: NavItem[] = [
  { 
    label: "Dashboard", 
    path: "/dashboard", 
    icon: BarChart3 
  },
  {
    label: "Training Plan",
    path: "/training-plan",
    icon: Target,
    children: [
      { label: "Programs", path: "/training-plan/programs", icon: Target },
      { label: "History", path: "/training-plan/instances", icon: Activity },
      { label: "Library", path: "/training-plan/library", icon: BookOpen }
    ]
  },
  {
    label: "My Schedule",
    path: "/calendar", 
    icon: Calendar
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3
  },
  {
    label: "Nutrition",
    path: "/nutrition",
    icon: Activity
  },
  {
    label: "Feed",
    path: "/feed", 
    icon: Users
  },
  { 
    label: "Chat", 
    path: "/chat", 
    icon: MessageSquare 
  },
  { 
    label: "Settings", 
    path: "/settings", 
    icon: Settings 
  }
];

// Helper function to get navigation items (always return all for solo experience)
export const getNavigationForRole = (role: string | undefined): NavItem[] => {
  return NAV_ROUTES;
};
