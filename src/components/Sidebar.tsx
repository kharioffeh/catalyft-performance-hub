
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { coachNavigation, soloNavigation } from '@/constants/navigation';
import { supabase } from '@/integrations/supabase/client';

// Accept isDarkTheme prop
const Sidebar = ({ isDarkTheme = false }: { isDarkTheme?: boolean }) => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Select navigation based on user role
  const navigationItems = profile?.role === 'coach' ? coachNavigation : soloNavigation;
  
  // Map navigation items to include active state
  const items = navigationItems.map(item => ({
    ...item,
    isActive: location.pathname === item.path || 
             (item.path === '/analytics' && location.pathname.startsWith('/analytics/'))
  }));

  // Styling for dark glass effect on chat/aria page
  const glassBg = isDarkTheme
    ? "bg-black/40 border-gray-800/40 backdrop-blur-lg"
    : "bg-white/10 border-white/20 backdrop-blur-md";
  const activeBg = isDarkTheme
    ? "bg-accent/30 text-white font-semibold border border-accent shadow-lg"
    : "bg-white/20 text-white font-semibold backdrop-blur-md border border-white/30 shadow-lg";
  const inactiveText = isDarkTheme ? "text-white/80 hover:bg-black/30" : "text-white/80 hover:bg-white/10";
  const borderBottom = isDarkTheme ? "border-gray-800/30" : "border-white/20";

  // Aria label for testing
  const ariaLabel = profile?.role === 'coach' ? 'coach-sidebar' : 'solo-sidebar';

  return (
    <aside 
      className={`w-64 h-full flex flex-col ${glassBg} border-r ${borderBottom} shadow-2xl`}
      aria-label={ariaLabel}
    >
      <div className={`flex items-center justify-center h-20 px-4 border-b ${borderBottom}`}>
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
                  ? activeBg
                  : `${inactiveText} hover:text-white hover:backdrop-blur-sm`
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </nav>
        <div className={`px-3 py-3 border-t ${borderBottom}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start px-2 h-auto py-2 ${inactiveText} hover:bg-black/30 hover:text-white`}>
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
            <DropdownMenuContent className={`w-56 ${glassBg} border ${borderBottom} shadow-xl`} align="end" forceMount>
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className={borderBottom} />
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="text-white/80 hover:bg-black/10 hover:text-white focus:bg-black/10 focus:text-white"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/subscriptions')}
                className="text-white/80 hover:bg-black/10 hover:text-white focus:bg-black/10 focus:text-white"
              >
                Subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator className={borderBottom} />
              <DropdownMenuItem 
                onClick={() => {
                  supabase.auth.signOut();
                  navigate('/login');
                }}
                className="text-white/80 hover:bg-black/10 hover:text-white focus:bg-black/10 focus:text-white"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
