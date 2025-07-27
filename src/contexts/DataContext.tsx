import React, { createContext, useContext, useEffect, useState } from 'react';
import { datastoreService } from '@/services/datastoreService';

// Ably types - temporary until package is installed
type AblyRealtime = any;

interface DataContextType {
  ably: AblyRealtime | null;
  datastoreReady: boolean;
  ablyConnected: boolean;
}

const DataContext = createContext<DataContextType>({
  ably: null,
  datastoreReady: false,
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
  const [datastoreReady, setDatastoreReady] = useState(false);
  const [ablyConnected, setAblyConnected] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      // Initialize Median Datastore
      try {
        await datastoreService.initializeDB();
        setDatastoreReady(true);
        console.log('✓ Median Datastore initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Median Datastore:', error);
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
      datastoreService.closeConnection();
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        ably,
        datastoreReady,
        ablyConnected,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};