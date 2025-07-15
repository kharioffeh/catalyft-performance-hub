import React, { useState } from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import { MobileNavigationSheet } from './MobileNavigationSheet';
import { useIsMobile } from '@/hooks/useBreakpoint';

export const ResponsiveNavigation: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  if (isMobile) {
    return (
      <MobileNavigationSheet
        isOpen={isMobileSheetOpen}
        onOpenChange={setIsMobileSheetOpen}
      />
    );
  }

  return <NavigationSidebar />;
};