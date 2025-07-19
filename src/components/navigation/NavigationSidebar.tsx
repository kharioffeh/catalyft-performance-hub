
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { getNavigationForRole } from '@/config/routes';
import { cn } from '@/lib/utils';

interface NavigationSidebarProps {
  className?: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ className }) => {
  const { profile } = useAuth();
  const { isOpen, close } = useSidebar();
  const location = useLocation();
  const navigationItems = getNavigationForRole(profile?.role);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:bg-black/30"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Transition
        show={isOpen}
        enter="transition-transform duration-300 ease-out"
        enterFrom="transform -translate-x-full"
        enterTo="transform translate-x-0"
        leave="transition-transform duration-200 ease-in"
        leaveFrom="transform translate-x-0"
        leaveTo="transform -translate-x-full"
      >
        <motion.aside
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-60 bg-brand-charcoal/90 backdrop-blur-xl border-r border-white/10",
            "flex flex-col overflow-hidden shadow-2xl",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-center p-4 border-b border-white/10">
            <div className="font-semibold text-brand-blue">
              Catalyft
            </div>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.children && item.children.some(child => location.pathname.startsWith(child.path)));
              
              return (
                <div key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={close}
                    className={({ isActive: linkActive }) =>
                      cn(
                        "flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                        "hover:bg-white/10 hover:text-white gap-3",
                        linkActive || isActive
                          ? "bg-brand-blue/20 text-brand-blue border-l-2 border-brand-blue"
                          : "text-white/60"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {item.label}
                    </span>
                  </NavLink>
                  
                  {/* Sub-navigation items */}
                  {item.children && isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-8 mt-2 space-y-1"
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={close}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                              "hover:bg-white/10 hover:text-white",
                              isActive
                                ? "bg-brand-blue/20 text-brand-blue"
                                : "text-white/60"
                            )
                          }
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          {child.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </nav>
        </motion.aside>
      </Transition>
    </>
  );
};
