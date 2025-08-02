
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsNavigation } from '@/hooks/useAnalyticsNavigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole } from '@/config/routes';
import { MobileNavigation } from './MobileNavigation';
import { DesktopNavigation } from './DesktopNavigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useAnalyticsNavigation();
  const { profile } = useAuth();

  const navigationItems = getNavigationForRole(profile?.role);

  const handleNavigation = (path: string) => {
    navigate(path, { method: 'menu' });
    onClose();
  };

  return (
    <>
      <MobileNavigation 
        navigationItems={navigationItems}
        profile={profile}
        navigate={navigate}
      />
      <DesktopNavigation 
        navigationItems={navigationItems}
        profile={profile}
        navigate={navigate}
      />
    </>
  );
}
