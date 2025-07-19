
import React from 'react';
import { NavigationSidebar } from './NavigationSidebar';

export const ResponsiveNavigation: React.FC = () => {
  // Always render NavigationSidebar - it will handle its own visibility state
  return <NavigationSidebar />;
};
