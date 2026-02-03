import { useState, useEffect, useCallback } from 'react';

// Type guard for React Native WebView environment
declare global {
  interface Window {
    ReactNativeWebView?: unknown;
  }
}

const STORAGE_KEY = 'mobileDrawerCollapsed';

// Fallback storage for web (will use localStorage for web, MMKV for native)
const storage = {
  getBoolean: (key: string): boolean | undefined => {
    try {
      // Try React Native MMKV first
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        const { MMKV } = require('react-native-mmkv');
        const mmkv = new MMKV();
        return mmkv.getBoolean(key);
      }
    } catch (e) {
      // Fall back to localStorage
    }
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : undefined;
    }
    return undefined;
  },
  set: (key: string, value: boolean) => {
    try {
      // Try React Native MMKV first
      if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        const { MMKV } = require('react-native-mmkv');
        const mmkv = new MMKV();
        mmkv.set(key, value);
        return;
      }
    } catch (e) {
      // Fall back to localStorage
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};

export const useMobileDrawerCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    // Check storage first
    const stored = storage.getBoolean(STORAGE_KEY);
    if (stored !== undefined) {
      return stored;
    }
    
    // Default to collapsed on smaller screens (< 400px width)
    if (typeof window !== 'undefined') {
      return window.innerWidth < 400;
    }
    return true; // Default to collapsed
  });

  // Handle responsive collapse on window resize
  useEffect(() => {
    const handleResize = () => {
      // Only auto-collapse on small screens if not manually set
      const stored = storage.getBoolean(STORAGE_KEY);
      if (stored === undefined && window.innerWidth < 400) {
        setIsCollapsed(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Persist to storage whenever state changes
  useEffect(() => {
    storage.set(STORAGE_KEY, isCollapsed);
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