import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sidebarCollapsed';

export const useSidebarCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
    
    // Default to collapsed on smaller screens
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024; // lg breakpoint
    }
    
    return false;
  });

  // Handle responsive collapse on window resize
  useEffect(() => {
    const handleResize = () => {
      // Only auto-collapse on small screens if not manually set
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null && window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return {
    isCollapsed,
    toggle,
    setIsCollapsed
  };
};