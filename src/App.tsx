/**
 * Main App Component with HealthKit Integration
 * 
 * This is the root component for a React Native app with Apple Watch integration.
 */

import React, { useEffect, useState } from 'react';
import {
  AppState,
  Platform,
  Alert,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { healthKitService } from '@/services/HealthKitService';

// Real React Native imports (commented for web compatibility)
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import BackgroundTimer from 'react-native-background-timer';

// Your app's main navigation/screen components
import MainNavigator from '@/navigation/MainNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const App: React.FC = () => {
  const [isHealthKitInitialized, setIsHealthKitInitialized] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Initialize HealthKit on app startup
  useEffect(() => {
    initializeHealthKit();
  }, []);

  // Handle app state changes for background sync
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const initializeHealthKit = async () => {
    try {
      // Only initialize on iOS
      if (Platform.OS !== 'ios') {
        console.log('HealthKit only available on iOS');
        return;
      }

      console.log('Initializing HealthKit...');
      
      // Check if HealthKit is available
      const isAvailable = await healthKitService.initialize();
      if (!isAvailable) {
        console.log('HealthKit not available on this device');
        return;
      }

      // Check if we've already requested permissions
      const hasRequestedPermissions = await getStoredPermissionStatus();
      
      if (!hasRequestedPermissions) {
        // Show permission request dialog
        Alert.alert(
          'Apple Watch Integration',
          'Connect your Apple Watch to get accurate calorie tracking and activity monitoring. Your health data stays private and secure.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => {
                setIsHealthKitInitialized(true);
              },
            },
            {
              text: 'Connect',
              onPress: async () => {
                await requestHealthKitPermissions();
              },
            },
          ]
        );
      } else {
        // Permissions already requested, just initialize
        const hasPermissions = await healthKitService.requestPermissions();
        if (hasPermissions) {
          await setupHealthKitSync();
        }
        setIsHealthKitInitialized(true);
      }
    } catch (error) {
      console.error('HealthKit initialization error:', error);
      setIsHealthKitInitialized(true); // Continue without HealthKit
    }
  };

  const requestHealthKitPermissions = async () => {
    try {
      const hasPermissions = await healthKitService.requestPermissions();
      
      if (hasPermissions) {
        console.log('HealthKit permissions granted');
        await storePermissionStatus(true);
        await setupHealthKitSync();
        
        Alert.alert(
          'Apple Watch Connected!',
          'Your Apple Watch is now connected. We\'ll automatically sync your activity data to provide accurate calorie tracking.',
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        console.log('HealthKit permissions denied');
        await storePermissionStatus(false);
        
        Alert.alert(
          'Permissions Not Granted',
          'You can enable Apple Watch integration later in Settings > Health > Data Access & Devices.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error requesting HealthKit permissions:', error);
    } finally {
      setIsHealthKitInitialized(true);
    }
  };

  const setupHealthKitSync = async () => {
    try {
      console.log('Setting up HealthKit background sync...');
      
      // Setup background observers
      await healthKitService.setupBackgroundSync();
      
      // Initial sync of recent data
      await healthKitService.syncWithBackend(7); // Last 7 days
      
      console.log('HealthKit sync setup completed');
    } catch (error) {
      console.error('Error setting up HealthKit sync:', error);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground, triggering HealthKit sync...');
      
      // Sync recent data when app becomes active
      try {
        const permissionStatus = await healthKitService.getPermissionStatus();
        if (permissionStatus.activeEnergyBurned) {
          await healthKitService.syncWithBackend(2); // Last 2 days
        }
      } catch (error) {
        console.error('Background sync error:', error);
      }
    }
    
    setAppState(nextAppState);
  };

  // Helper functions for permission storage
  const getStoredPermissionStatus = async (): Promise<boolean> => {
    try {
      // In a real app, use AsyncStorage:
      // const status = await AsyncStorage.getItem('healthkit_permissions_requested');
      // return status === 'true';
      return false; // Mock for web
    } catch (error) {
      return false;
    }
  };

  const storePermissionStatus = async (requested: boolean): Promise<void> => {
    try {
      // In a real app, use AsyncStorage:
      // await AsyncStorage.setItem('healthkit_permissions_requested', requested.toString());
      console.log(`Storing permission status: ${requested}`);
    } catch (error) {
      console.error('Error storing permission status:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
