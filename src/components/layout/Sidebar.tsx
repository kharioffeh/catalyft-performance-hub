
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
import { getNavigationForRole } from '@/config/routes';
import { NavigationGroup } from './NavigationGroup';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Get navigation items based on user role
  const navigationItems = getNavigationForRole(profile?.role);

  // Theme-aware styling classes
  const glassBg = cn(
    "bg-glass-card-light/40 dark:bg-glass-card-dark/60",
    "border-white/20 dark:border-white/10 backdrop-blur-lg"
  );
  
  const headerBg = cn(
    "bg-glass-card-light/40 dark:bg-glass-card-dark/60",
    "backdrop-blur-lg border-white/20 dark:border-white/10"
  );
  
  const drawerBg = cn(
    "bg-gradient-to-b from-surface-light/90 to-surface-light/80",
    "dark:from-surface-dark/90 dark:to-surface-dark/80"
  );
  
  const desktopBg = cn(
    "bg-gradient-to-b from-surface-light/90 to-surface-light/80",
    "dark:from-surface-dark/90 dark:to-surface-dark/80",
    "border-white/20 dark:border-white/10"
  );

  const activeBg = cn(
    "bg-theme-accent/20 text-gray-800 dark:text-white font-semibold",
    "border border-theme-accent/30 shadow-glass-sm"
  );
  
  const inactiveText = cn(
    "text-gray-700 dark:text-white/80",
    "hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30",
    "hover:text-gray-900 dark:hover:text-white"
  );

  const borderColor = "border-white/20 dark:border-white/10";

  return (
    <>
      {/* ─── Mobile drawer (≤ lg) ─── */}
      <Disclosure as="nav" className="lg:hidden">
        {({ open }) => (
          <>
            <div className={cn(
              "fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4",
              headerBg,
              "border-b"
            )}>
              <span className="font-semibold tracking-tight text-gray-800 dark:text-white">Catalyft</span>
              <Disclosure.Button className={cn(
                "rounded-md p-2 transition-colors",
                "text-gray-700 dark:text-white/80",
                "hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/60",
                "focus:outline-none"
              )}>
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
                className={cn(
                  "fixed inset-y-0 left-0 z-30 w-60 overflow-y-auto pt-16 shadow-glass-lg",
                  drawerBg
                )}
              >
                <NavList 
                  navigationItems={navigationItems} 
                  activeBg={activeBg} 
                  inactiveText={inactiveText}
                />
                <UserProfile 
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
      <aside className={cn(
        "hidden lg:flex lg:h-screen lg:w-60 lg:flex-col shadow-glass-md",
        desktopBg,
        "border-r"
      )}>
        <div className="flex items-center justify-center py-6 text-xl font-semibold text-gray-800 dark:text-white">
          Catalyft
        </div>
        <NavList 
          navigationItems={navigationItems} 
          activeBg={activeBg} 
          inactiveText={inactiveText}
        />
        <UserProfile 
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
  navigationItems: any[];
  activeBg: string;
  inactiveText: string;
}

function NavList({ navigationItems, activeBg, inactiveText }: NavListProps) {
  return (
    <ul className="flex flex-col gap-1 px-2 py-4">
      {navigationItems.map((item) => (
        <li key={item.path}>
          <NavigationGroup
            item={item}
            activeBg={activeBg}
            inactiveText={inactiveText}
          />
        </li>
      ))}
    </ul>
  );
}

interface UserProfileProps {
  borderColor: string;
  inactiveText: string;
  profile: any;
  navigate: (path: string) => void;
}

function UserProfile({ borderColor, inactiveText, profile, navigate }: UserProfileProps) {
  return (
    <div className={cn("mt-auto px-3 py-3 border-t", borderColor)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn(
            "w-full justify-start px-2 h-auto py-2",
            inactiveText,
            "hover:text-gray-900 dark:hover:text-white"
          )}>
            <Avatar className="mr-3 w-8 h-8 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className={cn(
                "bg-glass-card-light/60 dark:bg-glass-card-dark/80",
                "border border-white/20 dark:border-white/10",
                "text-gray-800 dark:text-white backdrop-blur-md"
              )}>
                {profile?.full_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left truncate min-w-0">
              <span className="text-sm font-medium truncate">{profile?.full_name}</span>
              <span className="text-xs text-gray-500 dark:text-white/60 truncate">{profile?.email}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={cn(
            "w-56 shadow-glass-lg",
            "bg-glass-card-light/90 dark:bg-glass-card-dark/90",
            "border border-white/20 dark:border-white/10 backdrop-blur-md"
          )} 
          align="end" 
          forceMount
        >
          <DropdownMenuLabel className="text-gray-800 dark:text-white">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className={borderColor} />
          <DropdownMenuItem 
            onClick={() => navigate('/settings')}
            className="text-gray-700 dark:text-white/80 hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30 hover:text-gray-900 dark:hover:text-white focus:bg-glass-card-light/60 dark:focus:bg-glass-card-dark/30 focus:text-gray-900 dark:focus:text-white"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/subscriptions')}
            className="text-gray-700 dark:text-white/80 hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30 hover:text-gray-900 dark:hover:text-white focus:bg-glass-card-light/60 dark:focus:bg-glass-card-dark/30 focus:text-gray-900 dark:focus:text-white"
          >
            Subscription
          </DropdownMenuItem>
          <DropdownMenuSeparator className={borderColor} />
          <DropdownMenuItem 
            onClick={() => {
              supabase.auth.signOut();
              navigate('/login');
            }}
            className="text-gray-700 dark:text-white/80 hover:bg-glass-card-light/60 dark:hover:bg-glass-card-dark/30 hover:text-gray-900 dark:hover:text-white focus:bg-glass-card-light/60 dark:focus:bg-glass-card-dark/30 focus:text-gray-900 dark:focus:text-white"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
