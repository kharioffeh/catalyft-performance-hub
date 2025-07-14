
import React from 'react';
import { NavigationGroup } from './NavigationGroup';

interface NavigationListProps {
  navigationItems: any[];
  activeBg: string;
  inactiveText: string;
  isCollapsed?: boolean;
}

export const NavigationList: React.FC<NavigationListProps> = ({
  navigationItems,
  activeBg,
  inactiveText,
  isCollapsed = false,
}) => {
  return (
    <ul className="flex flex-col gap-1 px-2 py-4">
      {navigationItems.map((item) => (
        <li key={item.path}>
          <NavigationGroup
            item={item}
            activeBg={activeBg}
            inactiveText={inactiveText}
            isCollapsed={isCollapsed}
          />
        </li>
      ))}
    </ul>
  );
};
