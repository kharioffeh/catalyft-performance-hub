import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole } from '@/config/routes';
import { cn } from '@/lib/utils';

interface NavigationSidebarProps {
  className?: string;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useAuth();
  const location = useLocation();
  const navigationItems = getNavigationForRole(profile?.role);

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  return (
    <Transition
      show={true}
      enter="transition-all duration-300 ease-out"
      enterFrom="transform -translate-x-full"
      enterTo="transform translate-x-0"
      leave="transition-all duration-300 ease-in"
      leaveFrom="transform translate-x-0"
      leaveTo="transform -translate-x-full"
    >
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-brand-charcoal/90 backdrop-blur-xl border-r border-white/10",
          "flex flex-col overflow-hidden shadow-2xl",
          className
        )}
      >
        {/* Header with hamburger */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-brand-blue"
              >
                Catalyft
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-brand-blue"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          </button>
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
                  className={({ isActive: linkActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                      "hover:bg-white/10 hover:text-white",
                      linkActive || isActive
                        ? "bg-brand-blue/20 text-brand-blue border-l-2 border-brand-blue"
                        : "text-white/60"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="ml-3 font-medium truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
                
                {/* Sub-navigation items */}
                {item.children && !isCollapsed && isActive && (
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
  );
};