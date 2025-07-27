import React, { createContext, useContext, useEffect, useState } from 'react';
import { sqliteService } from '@/services/sqliteService';

// Ably types - temporary until package is installed
type AblyRealtime = any;

interface DataContextType {
  ably: AblyRealtime | null;
  sqliteReady: boolean;
  ablyConnected: boolean;
}

const DataContext = createContext<DataContextType>({
  ably: null,
  sqliteReady: false,
  ablyConnected: false,
});

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [ably, setAbly] = useState<AblyRealtime | null>(null);
  const [sqliteReady, setSqliteReady] = useState(false);
  const [ablyConnected, setAblyConnected] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      // Initialize SQLite
      try {
        await sqliteService.initializeDB();
        setSqliteReady(true);
        console.log('✓ SQLite initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SQLite:', error);
      }

      // Initialize Ably (placeholder until package is installed)
      try {
        console.log('✓ Ably initialization placeholder - package needs to be installed');
        // TODO: Install ably package and implement proper initialization
        setAblyConnected(true);
      } catch (error) {
        console.error('Failed to initialize Ably:', error);
      }
    };

    initializeData();

    // Cleanup
    return () => {
      if (ably) {
        ably.close();
      }
      sqliteService.closeConnection();
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        ably,
        sqliteReady,
        ablyConnected,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};