import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  AlertTriangle,
  Dumbbell,
  FileText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const coachItems = [
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    { 
      icon: Users, 
      label: 'Athletes', 
      path: '/athletes',
      isActive: location.pathname === '/athletes'
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      path: '/calendar',
      isActive: location.pathname === '/calendar'
    },
    { 
      icon: MessageSquare, 
      label: 'Chat', 
      path: '/chat',
      isActive: location.pathname === '/chat'
    },
    { 
      icon: Dumbbell, 
      label: 'Workouts', 
      path: '/workout',
      isActive: location.pathname === '/workout'
    },
    { 
      icon: FileText, 
      label: 'Templates', 
      path: '/templates',
      isActive: location.pathname === '/templates'
    },
    { 
      icon: AlertTriangle, 
      label: 'Risk Board', 
      path: '/coach/risk',
      isActive: location.pathname === '/coach/risk'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      isActive: location.pathname === '/settings'
    },
  ];

  const athleteItems = [
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      path: '/calendar',
      isActive: location.pathname === '/calendar'
    },
    { 
      icon: MessageSquare, 
      label: 'Chat', 
      path: '/chat',
      isActive: location.pathname === '/chat'
    },
    { 
      icon: Dumbbell, 
      label: 'Workouts', 
      path: '/workout',
      isActive: location.pathname === '/workout'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      isActive: location.pathname === '/settings'
    },
  ];

  const items = profile?.role === 'coach' ? coachItems : athleteItems;
  const navigate = useNavigate();

  return (
    <div className="w-64 h-full flex flex-col bg-white border-r shadow-sm">
      <div className="flex items-center justify-center h-20 px-4">
        <span className="text-2xl font-bold text-blue-600">
          Catalyft
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-between overflow-y-auto">
        <nav className="flex flex-col space-y-1 px-3">
          {items.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`justify-start px-4 py-3 hover:bg-gray-100 w-full text-left ${item.isActive ? 'bg-gray-100 font-semibold' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 h-auto py-2">
                <Avatar className="mr-3 w-8 h-8 flex-shrink-0">
                  <AvatarImage src="" />
                  <AvatarFallback>{profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left truncate min-w-0">
                  <span className="text-sm font-medium truncate">{profile?.full_name}</span>
                  <span className="text-xs text-gray-500 truncate">{profile?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/subscription')}>
                Subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                supabase.auth.signOut();
                navigate('/login');
              }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
