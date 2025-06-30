
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShareData {
  chartRef: React.RefObject<HTMLElement>;
  metrics: any[];
  title: string;
  filename: string;
}

interface ShareUIContextType {
  isSheetOpen: boolean;
  shareData: ShareData | null;
  openSheet: (data: ShareData) => void;
  closeSheet: () => void;
}

const ShareUIContext = createContext<ShareUIContextType | undefined>(undefined);

export const useShareUI = () => {
  const context = useContext(ShareUIContext);
  if (!context) {
    throw new Error('useShareUI must be used within a ShareUIProvider');
  }
  return context;
};

interface ShareUIProviderProps {
  children: ReactNode;
}

export const ShareUIProvider: React.FC<ShareUIProviderProps> = ({ children }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  const openSheet = (data: ShareData) => {
    setShareData(data);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setShareData(null);
  };

  const value: ShareUIContextType = {
    isSheetOpen,
    shareData,
    openSheet,
    closeSheet,
  };

  return (
    <ShareUIContext.Provider value={value}>
      {children}
    </ShareUIContext.Provider>
  );
};
