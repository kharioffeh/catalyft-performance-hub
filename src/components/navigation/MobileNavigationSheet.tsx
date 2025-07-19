
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { getNavigationForRole } from '@/config/routes';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileNavigationSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavigationSheet: React.FC<MobileNavigationSheetProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigationItems = getNavigationForRole(profile?.role);

  const handleNavigation = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-left font-semibold text-foreground">
            CataLyft
          </SheetTitle>
        </SheetHeader>
        
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.children && item.children.some(child => location.pathname.startsWith(child.path)));
            
            return (
              <div key={item.path} className="space-y-1">
                <NavLink
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive: linkActive }) =>
                    cn(
                      "flex items-center px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      linkActive || isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-4 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
                
                {/* Sub-navigation items */}
                {item.children && isActive && (
                  <div className="ml-6 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={handleNavigation}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center px-4 py-2 rounded-md text-sm transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground"
                          )
                        }
                      >
                        <child.icon className="h-4 w-4 mr-3" />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
