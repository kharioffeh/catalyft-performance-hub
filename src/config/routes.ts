export type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: ("coach" | "athlete" | "solo")[];
  children?: NavItem[];
};

import {
  Home, BarChart3, Dumbbell, UsersRound,
  Settings, ChevronDown, ChevronUp, Calendar,
  MessageSquare, AlertTriangle, BookOpen, Activity, Target
} from "lucide-react";

export const NAV_ROUTES: NavItem[] = [
  { 
    label: "Dashboard", 
    path: "/dashboard", 
    icon: BarChart3 
  },
  { 
    label: "Program", 
    path: "/program", 
    icon: Activity, 
    roles: ["solo"] 
  },
  {
    label: "Training Plan",
    path: "/training-plan",
    icon: Calendar,
    roles: ["solo", "athlete"],
    children: [
      { label: "Programs", path: "/training-plan/programs", icon: Target },
      { label: "Instances", path: "/training-plan/instances", icon: Activity },
      { label: "Library", path: "/training-plan/library", icon: BookOpen }
    ]
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    roles: ["coach", "athlete"]
  },
  { 
    label: "Calendar", 
    path: "/calendar", 
    icon: Calendar, 
    roles: ["coach", "athlete"] 
  },
  { 
    label: "Athletes", 
    path: "/athletes", 
    icon: UsersRound, 
    roles: ["coach"] 
  },
  { 
    label: "Risk Board", 
    path: "/risk-board", 
    icon: AlertTriangle, 
    roles: ["coach"] 
  },
  { 
    label: "Training", 
    path: "/training-plan", 
    icon: Target, 
    roles: ["coach"],
    children: [
      { label: "Programs", path: "/training-plan/programs", icon: Target },
      { label: "Instances", path: "/training-plan/instances", icon: Activity },
      { label: "Library", path: "/training-plan/library", icon: BookOpen }
    ]
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

// Helper function to get navigation items for a specific role
export const getNavigationForRole = (role: string | undefined): NavItem[] => {
  return NAV_ROUTES.filter(item => 
    !item.roles || item.roles.includes(role as any)
  );
};
