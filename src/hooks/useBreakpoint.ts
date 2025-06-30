
import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';

const breakpoints = {
  sm: '(max-width: 639px)',
  md: '(min-width: 640px) and (max-width: 1023px)', 
  lg: '(min-width: 1024px) and (max-width: 1279px)',
  xl: '(min-width: 1280px)'
};

export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(breakpoints[breakpoint]);
    
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Add listener
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
};

export const useIsMobile = (): boolean => {
  return useBreakpoint('sm');
};

export const useIsPhone = (): boolean => {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 414px)');
    
    const handler = (event: MediaQueryListEvent) => {
      setIsPhone(event.matches);
    };

    // Set initial value
    setIsPhone(mediaQuery.matches);
    
    // Add listener
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isPhone;
};
