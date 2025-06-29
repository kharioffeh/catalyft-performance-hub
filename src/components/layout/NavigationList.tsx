
import React from 'react';
import { NavigationGroup } from './NavigationGroup';

interface NavigationListProps {
  navigationItems: any[];
  activeBg: string;
  inactiveText: string;
}

export const NavigationList: React.FC<NavigationListProps> = ({
  navigationItems,
  activeBg,
  inactiveText,
}) => {
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
};
