
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNavigationForRole } from '@/config/routes';
import { MobileNavigation } from './MobileNavigation';
import { DesktopNavigation } from './DesktopNavigation';

export default function Sidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Get navigation items based on user role
  const navigationItems = getNavigationForRole(profile?.role);

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
