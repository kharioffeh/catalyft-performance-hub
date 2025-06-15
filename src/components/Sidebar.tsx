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
  FileText,
  TrendingUp
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
      icon: TrendingUp, 
      label: 'Analytics', 
      path: '/analytics',
      isActive: location.pathname === '/analytics' || location.pathname.startsWith('/analytics/')
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
      label: 'ARIA', 
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
      icon: AlertTriangle, 
      label: 'Risk Board', 
      path: '/risk-board',
      isActive: location.pathname === '/risk-board'
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
      icon: TrendingUp, 
      label: 'Analytics', 
      path: '/analytics',
      isActive: location.pathname === '/analytics' || location.pathname.startsWith('/analytics/')
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      path: '/calendar',
      isActive: location.pathname === '/calendar'
    },
    { 
      icon: MessageSquare, 
      label: 'ARIA', 
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
    <div className="w-64 h-full flex flex-col bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl">
      <div className="flex items-center justify-center h-20 px-4 border-b border-white/20">
        <span className="text-2xl font-bold text-white">
          Catalyft
        </span>
      </div>

      <div className="flex-grow flex flex-col justify-between overflow-y-auto">
        <nav className="flex flex-col space-y-1 px-3 py-4">
          {items.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`justify-start px-4 py-3 w-full text-left transition-all duration-200 ${
                item.isActive 
                  ? 'bg-white/20 text-white font-semibold backdrop-blur-md border border-white/30 shadow-lg' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 h-auto py-2 text-white/80 hover:bg-white/10 hover:text-white">
                <Avatar className="mr-3 w-8 h-8 flex-shrink-0">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-white/20 text-white backdrop-blur-md">
                    {profile?.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left truncate min-w-0">
                  <span className="text-sm font-medium truncate">{profile?.full_name}</span>
                  <span className="text-xs text-white/60 truncate">{profile?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl" align="end" forceMount>
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/subscriptions')}
                className="text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              >
                Subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={() => {
                  supabase.auth.signOut();
                  navigate('/login');
                }}
                className="text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
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
