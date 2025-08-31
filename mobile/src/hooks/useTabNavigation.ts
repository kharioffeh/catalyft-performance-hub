import { useState, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

interface UseTabNavigationProps {
  initialTab?: number;
  tabCount: number;
}

export const useTabNavigation = ({ initialTab = 0, tabCount }: UseTabNavigationProps) => {
  const [currentTab, setCurrentTab] = useState(initialTab);
  const navigation = useNavigation();
  const tabHistory = useRef<number[]>([initialTab]);

  const navigateToTab = useCallback((tabIndex: number) => {
    if (tabIndex === currentTab) return;

    // Add to history
    tabHistory.current.push(tabIndex);
    
    // Keep only last 10 tabs in history
    if (tabHistory.current.length > 10) {
      tabHistory.current = tabHistory.current.slice(-10);
    }

    setCurrentTab(tabIndex);
  }, [currentTab]);

  const goToPreviousTab = useCallback(() => {
    if (tabHistory.current.length > 1) {
      tabHistory.current.pop(); // Remove current tab
      const previousTab = tabHistory.current[tabHistory.current.length - 1];
      setCurrentTab(previousTab);
    }
  }, []);

  const resetToTab = useCallback((tabIndex: number) => {
    tabHistory.current = [tabIndex];
    setCurrentTab(tabIndex);
  }, []);

  const getTabHistory = useCallback(() => {
    return [...tabHistory.current];
  }, []);

  return {
    currentTab,
    navigateToTab,
    goToPreviousTab,
    resetToTab,
    getTabHistory,
    tabCount,
  };
};