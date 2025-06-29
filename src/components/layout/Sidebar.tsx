
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Disclosure, Transition } from '@headlessui/react';
import {
  Menu as MenuIcon,
  X as XIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { coachNavigation, soloNavigation } from '@/constants/navigation';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  isDarkTheme?: boolean;
}

export default function Sidebar({ isDarkTheme = false }: SidebarProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Select navigation based on user role
  const navigationItems = profile?.role === 'coach' ? coachNavigation : soloNavigation;

  // Styling for dark glass effect on chat/aria page
  const glassBg = isDarkTheme
    ? "bg-black/40 border-gray-800/40 backdrop-blur-lg"
    : "bg-slate-900/80 backdrop-blur-md";
  
  const headerBg = isDarkTheme
    ? "bg-black/40 backdrop-blur-lg border-gray-800/40"
    : "bg-slate-900/80 backdrop-blur-md";
  
  const drawerBg = isDarkTheme
    ? "bg-gradient-to-b from-black/60 via-gray-900/60 to-black/60 backdrop-blur-lg"
    : "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900";
  
  const desktopBg = isDarkTheme
    ? "bg-gradient-to-b from-black/60 via-gray-900/60 to-black/60 backdrop-blur-lg border-gray-800/40"
    : "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900";

  const activeBg = isDarkTheme
    ? "bg-accent/30 text-white font-semibold border border-accent shadow-lg"
    : "bg-indigo-600 text-white hover:bg-indigo-500";
  
  const inactiveText = isDarkTheme 
    ? "text-white/80 hover:bg-black/30 hover:text-white" 
    : "text-slate-300 hover:bg-slate-700/60 hover:text-white";

  const borderColor = isDarkTheme ? "border-gray-800/30" : "border-slate-700";

  return (
    <>
      {/* ─── Mobile drawer (≤ lg) ─── */}
      <Disclosure as="nav" className="lg:hidden">
        {({ open }) => (
          <>
            <div className={`fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 ${headerBg} ${isDarkTheme ? 'border-b border-gray-800/40' : ''}`}>
              <span className="font-semibold tracking-tight text-white">Catalyft</span>
              <Disclosure.Button className="rounded-md p-2 text-slate-100 hover:bg-slate-800 focus:outline-none">
                {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </Disclosure.Button>
            </div>

            <Transition
              enter="transition-transform duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Disclosure.Panel
                static
                className={`fixed inset-y-0 left-0 z-30 w-60 overflow-y-auto pt-16 shadow-lg ${drawerBg}`}
              >
                <NavList 
                  navigationItems={navigationItems} 
                  activeBg={activeBg} 
                  inactiveText={inactiveText}
                />
                <UserProfile 
                  isDarkTheme={isDarkTheme} 
                  borderColor={borderColor} 
                  inactiveText={inactiveText}
                  profile={profile}
                  navigate={navigate}
                />
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>

      {/* ─── Desktop rail (≥ lg) ─── */}
      <aside className={`hidden lg:flex lg:h-screen lg:w-60 lg:flex-col shadow-inner ${desktopBg} ${isDarkTheme ? 'border-r border-gray-800/40' : ''}`}>
        <div className="flex items-center justify-center py-6 text-xl font-semibold text-white">
          Catalyft
        </div>
        <NavList 
          navigationItems={navigationItems} 
          activeBg={activeBg} 
          inactiveText={inactiveText}
        />
        <UserProfile 
          isDarkTheme={isDarkTheme} 
          borderColor={borderColor} 
          inactiveText={inactiveText}
          profile={profile}
          navigate={navigate}
        />
      </aside>
    </>
  );
}

interface NavListProps {
  navigationItems: typeof coachNavigation;
  activeBg: string;
  inactiveText: string;
}

function NavList({ navigationItems, activeBg, inactiveText }: NavListProps) {
  return (
    <ul className="flex flex-col gap-1 px-2 py-4">
      {navigationItems.map(({ path, label, icon: Icon }) => (
        <li key={path}>
          <NavLink
            to={path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? activeBg
                  : inactiveText
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

interface UserProfileProps {
  isDarkTheme: boolean;
  borderColor: string;
  inactiveText: string;
  profile: any;
  navigate: (path: string) => void;
}

function UserProfile({ isDarkTheme, borderColor, inactiveText, profile, navigate }: UserProfileProps) {
  return (
    <div className={`mt-auto px-3 py-3 border-t ${borderColor}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={`w-full justify-start px-2 h-auto py-2 ${inactiveText} ${isDarkTheme ? 'hover:bg-black/30' : 'hover:bg-slate-700/60'} hover:text-white`}>
            <Avatar className="mr-3 w-8 h-8 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className={`${isDarkTheme ? 'bg-black/40 border border-gray-800/40' : 'bg-white/20'} text-white backdrop-blur-md`}>
                {profile?.full_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left truncate min-w-0">
              <span className="text-sm font-medium truncate">{profile?.full_name}</span>
              <span className="text-xs text-white/60 truncate">{profile?.email}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={`w-56 ${isDarkTheme ? 'bg-black/40 border border-gray-800/40 backdrop-blur-lg' : 'bg-slate-800/90 border border-slate-700 backdrop-blur-md'} shadow-xl`} 
          align="end" 
          forceMount
        >
          <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className={borderColor} />
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
          <DropdownMenuSeparator className={borderColor} />
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
  );
}
