
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PeriodValue = '7d' | '30d' | '90d';

interface PeriodContextType {
  period: PeriodValue;
  setPeriod: (period: PeriodValue) => void;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

interface PeriodProviderProps {
  children: ReactNode;
}

export const PeriodProvider: React.FC<PeriodProviderProps> = ({ children }) => {
  const [period, setPeriodState] = useState<PeriodValue>('30d');

  // Load period from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('analytics-period');
    if (saved && ['7d', '30d', '90d'].includes(saved)) {
      setPeriodState(saved as PeriodValue);
    }
  }, []);

  // Save period to localStorage when changed
  const setPeriod = (newPeriod: PeriodValue) => {
    setPeriodState(newPeriod);
    localStorage.setItem('analytics-period', newPeriod);
  };

  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
};

export const usePeriod = (): PeriodContextType => {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
};

// Helper function to convert period to days
export const periodToDays = (period: PeriodValue): number => {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 30;
  }
};
