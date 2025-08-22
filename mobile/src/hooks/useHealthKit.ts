import { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import { WearableManager } from '../services/wearables/WearableManager';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface HealthKitStatus {
  isAvailable: boolean;
  isAuthorized: boolean;
  isInitializing: boolean;
  error?: string;
}

export const useHealthKit = () => {
  const [status, setStatus] = useState<HealthKitStatus>({
    isAvailable: false,
    isAuthorized: false,
    isInitializing: true,
  });

  useEffect(() => {
    initializeHealthKit();
  }, []);

  const initializeHealthKit = async () => {
    // Only run on iOS
    if (Platform.OS !== 'ios') {
      setStatus({
        isAvailable: false,
        isAuthorized: false,
        isInitializing: false,
        error: 'HealthKit is only available on iOS',
      });
      return;
    }

    try {
      // Check if we're on a physical device (HealthKit not available on simulator)
      const isSimulator = await checkIfSimulator();
      if (isSimulator) {
        setStatus({
          isAvailable: false,
          isAuthorized: false,
          isInitializing: false,
          error: 'HealthKit is not available on iOS Simulator. Please test on a physical device.',
        });
        return;
      }

      // Try to connect to Apple HealthKit
      const wearableManager = WearableManager.getInstance();
      
      // Check if Apple Watch is already connected
      const devices = wearableManager.getDevices();
      const appleWatchConnected = devices.some(d => d.type === 'apple_watch' && d.connected);
      
      if (!appleWatchConnected) {
        // Attempt to add Apple Watch/HealthKit
        try {
          const device = await wearableManager.addDevice('apple_watch');
          
          setStatus({
            isAvailable: true,
            isAuthorized: true,
            isInitializing: false,
          });
          
          console.log('HealthKit connected successfully:', device);
        } catch (error) {
          // User denied permissions or other error
          setStatus({
            isAvailable: true,
            isAuthorized: false,
            isInitializing: false,
            error: error instanceof Error ? error.message : 'Failed to connect HealthKit',
          });
        }
      } else {
        setStatus({
          isAvailable: true,
          isAuthorized: true,
          isInitializing: false,
        });
      }
    } catch (error) {
      setStatus({
        isAvailable: false,
        isAuthorized: false,
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const checkIfSimulator = async (): Promise<boolean> => {
    // Check if running on simulator
    // This is a simple heuristic - in production you'd use a more robust method
    try {
      const { isEmulator } = require('react-native-device-info');
      return await isEmulator();
    } catch {
      // If react-native-device-info is not installed, check another way
      // On simulator, certain features are not available
      return Platform.isPad || Platform.isTV;
    }
  };

  const requestHealthKitPermissions = async () => {
    if (!status.isAvailable) {
      Alert.alert(
        'HealthKit Not Available',
        'HealthKit is not available on this device. Please ensure you are using a physical iPhone with iOS 13.0 or later.',
        [{ text: 'OK' }]
      );
      return false;
    }

    setStatus(prev => ({ ...prev, isInitializing: true }));

    try {
      const wearableManager = WearableManager.getInstance();
      const device = await wearableManager.addDevice('apple_watch');
      
      setStatus({
        isAvailable: true,
        isAuthorized: true,
        isInitializing: false,
      });
      
      return true;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isAuthorized: false,
        isInitializing: false,
        error: error instanceof Error ? error.message : 'Failed to authorize HealthKit',
      }));
      
      Alert.alert(
        'HealthKit Authorization Failed',
        'Please go to Settings > Privacy > Health > Catalyft and enable all permissions.',
        [{ text: 'OK' }]
      );
      
      return false;
    }
  };

  const syncHealthData = async () => {
    if (!status.isAuthorized) {
      const authorized = await requestHealthKitPermissions();
      if (!authorized) return;
    }

    try {
      const wearableManager = WearableManager.getInstance();
      const devices = wearableManager.getDevices();
      const appleWatch = devices.find(d => d.type === 'apple_watch');
      
      if (appleWatch) {
        const result = await wearableManager.syncDevice(appleWatch.id);
        
        if (result?.success) {
          Alert.alert(
            'Sync Complete',
            `Successfully synced ${result.itemsSynced} items from Apple Health.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Sync Failed',
            result?.errors?.join('\n') || 'Failed to sync health data',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Sync Error',
        error instanceof Error ? error.message : 'An error occurred while syncing',
        [{ text: 'OK' }]
      );
    }
  };

  return {
    ...status,
    requestPermissions: requestHealthKitPermissions,
    syncData: syncHealthData,
    reinitialize: initializeHealthKit,
  };
};