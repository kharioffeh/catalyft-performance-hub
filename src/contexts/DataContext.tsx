import React, { createContext, useContext, useEffect, useState } from 'react';
import { datastoreService } from '@/services/datastoreService';

interface DataContextType {
  datastoreReady: boolean;
}

const DataContext = createContext<DataContextType>({
  datastoreReady: false,
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
  const [datastoreReady, setDatastoreReady] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      // Initialize Median Datastore
      try {
        await datastoreService.initializeDB();
        setDatastoreReady(true);
      } catch (error) {
        console.error('Failed to initialize Median Datastore:', error);
        // Still mark as ready to not block the app
        setDatastoreReady(true);
      }
    };

    initializeData();

    // Cleanup
    return () => {
      datastoreService.closeConnection();
    };
  }, []);

  return (
    <DataContext.Provider value={{ datastoreReady }}>
      {children}
    </DataContext.Provider>
  );
};
