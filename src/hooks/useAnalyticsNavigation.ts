import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useCallback } from 'react';

/**
 * Custom hook that wraps useNavigate to add analytics tracking for navigation events
 */
export const useAnalyticsNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const analytics = useAnalytics();

  const analyticsNavigate = useCallback((
    to: string | number,
    options?: { 
      replace?: boolean;
      state?: any;
      method?: 'tab' | 'menu' | 'link' | 'button';
    }
  ) => {
    // Only track if it's a string path (not back/forward navigation)
    if (typeof to === 'string') {
      analytics.trackNavigation(
        location.pathname, 
        to, 
        options?.method || 'link'
      );
    }

    // Perform the actual navigation
    if (typeof to === 'string') {
      navigate(to, options);
    } else {
      navigate(to);
    }
  }, [navigate, location.pathname, analytics]);

  return analyticsNavigate;
};