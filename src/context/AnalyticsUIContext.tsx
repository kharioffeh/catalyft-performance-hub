
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AnalyticsUIContextType {
  // Mobile pager state
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
  
  // Refresh functionality
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  
  // Detail sheet state
  selectedMetric: string | null;
  setSelectedMetric: (metric: string | null) => void;
}

const AnalyticsUIContext = createContext<AnalyticsUIContextType | undefined>(undefined);

export const useAnalyticsUI = () => {
  const context = useContext(AnalyticsUIContext);
  if (!context) {
    throw new Error('useAnalyticsUI must be used within an AnalyticsUIProvider');
  }
  return context;
};

interface AnalyticsUIProviderProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}

export const AnalyticsUIProvider: React.FC<AnalyticsUIProviderProps> = ({ 
  children, 
  onRefresh 
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  const value: AnalyticsUIContextType = {
    currentPageIndex,
    setCurrentPageIndex,
    isRefreshing,
    refreshData,
    selectedMetric,
    setSelectedMetric,
  };

  return (
    <AnalyticsUIContext.Provider value={value}>
      {children}
    </AnalyticsUIContext.Provider>
  );
};
