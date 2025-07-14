import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NavItem } from '@/config/routes';
import clsx from 'clsx';

interface NavigationGroupProps {
  item: NavItem;
  activeBg: string;
  inactiveText: string;
  isCollapsed?: boolean;
}

export const NavigationGroup: React.FC<NavigationGroupProps> = ({
  item,
  activeBg,
  inactiveText,
  isCollapsed = false,
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    // Keep group open if any child route is active and not collapsed
    return !isCollapsed && (item.children?.some(child => 
      location.pathname === child.path || location.pathname.startsWith(child.path + '/')
    ) || false);
  });

  const Icon = item.icon;

  // Close dropdown when collapsed
  React.useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false);
    }
  }, [isCollapsed]);

  if (!item.children || item.children.length === 0) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          clsx(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
            isCollapsed ? "justify-center" : "gap-3",
            isActive ? activeBg : inactiveText
          )
        }
        title={isCollapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </NavLink>
    );
  }

  // For items with children, when collapsed, just link to the main item
  if (isCollapsed) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          clsx(
            "flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
            isActive ? activeBg : inactiveText
          )
        }
        title={item.label}
      >
        <Icon className="h-5 w-5 shrink-0" />
      </NavLink>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 w-full",
          inactiveText
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="ml-6 space-y-1 border-l border-white/10 pl-3">
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <NavLink
                key={child.path}
                to={child.path}
                end={child.path === item.path}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive ? activeBg : inactiveText
                  )
                }
              >
                <ChildIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};
