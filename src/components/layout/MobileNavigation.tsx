
import React, { useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavigationList } from './NavigationList';
import { UserProfile } from './UserProfile';
import { ProtocolsSheet } from '@/components/ProtocolsSheet';

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
  const [protocolsOpen, setProtocolsOpen] = useState(false);
  const headerBg = cn(
    "bg-brand-charcoal/90 backdrop-blur-lg",
    "border-white-12"
  );
  
  const drawerBg = cn(
    "bg-brand-charcoal/95 backdrop-blur-lg"
  );

  const activeBg = cn(
    "bg-brand-blue/20 text-brand-blue font-semibold",
    "border-l-2 border-brand-blue shadow-glass-sm"
  );
  
  const inactiveText = cn(
    "text-white-60",
    "hover:bg-white/10",
    "hover:text-white-90"
  );

  const borderColor = "border-white-12";

  return (
    <Disclosure as="nav" className="lg:hidden">
      {({ open }) => (
        <>
          <div className={cn(
            "fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4",
            headerBg,
            "border-b"
          )}>
            <span className="font-semibold tracking-tight text-brand-blue">Catalyft</span>
            <div className="flex items-center space-x-2">
              {/* Protocols Sheet Toggle */}
              <button
                onClick={() => setProtocolsOpen(true)}
                className={cn(
                  "rounded-md p-2 transition-colors",
                  "text-brand-blue",
                  "hover:bg-white/10",
                  "focus:outline-none focus-brand"
                )}
                aria-label="Open mobility protocols"
              >
                <span className="text-lg">🧘</span>
              </button>
              
              <Disclosure.Button className={cn(
                "rounded-md p-2 transition-colors",
                "text-brand-blue",
                "hover:bg-white/10",
                "focus:outline-none focus-brand"
              )}>
                {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </Disclosure.Button>
            </div>
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
          
          {/* Protocols Sheet */}
          <ProtocolsSheet
            open={protocolsOpen}
            onClose={() => setProtocolsOpen(false)}
            onProtocolSelect={(protocol) => {
              // TODO: Navigate to protocol detail screen
            }}
          />
        </>
      )}
    </Disclosure>
  );
};
