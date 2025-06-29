
import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavigationList } from './NavigationList';
import { UserProfile } from './UserProfile';

interface MobileNavigationProps {
  navigationItems: any[];
  profile: any;
  navigate: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  navigationItems,
  profile,
  navigate,
}) => {
  const headerBg = cn(
    "bg-glass-card-light/40 dark:bg-glass-card-dark/60",
    "backdrop-blur-lg border-white/20 dark:border-white/10"
  );
  
  const drawerBg = cn(
    "bg-gradient-to-b from-surface-light/90 to-surface-light/80",
    "dark:from-surface-dark/90 dark:to-surface-dark/80"
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
              <NavigationList 
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
  );
};
