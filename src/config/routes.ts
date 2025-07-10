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
    roles: ["solo", "athlete"]
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
    icon: BookOpen, 
    roles: ["coach"] 
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
