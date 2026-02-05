/**
 * React Hook for HealthKit Sync Management
 * 
 * This hook provides an easy interface for React Native components
 * to interact with HealthKit and manage sync status.
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { healthKitService } from '@/services/HealthKitService';
import { useAuth } from '@/contexts/AuthContext';

interface HealthKitSyncStatus {
  isAvailable: boolean;
  hasPermissions: boolean;
  isInitialized: boolean;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  error: string | null;
}

interface UseHealthKitSyncReturn {
  status: HealthKitSyncStatus;
  initializeHealthKit: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  syncNow: (days?: number) => Promise<boolean>;
  getPermissionStatus: () => Promise<{ [key: string]: boolean }>;
  setupBackgroundSync: () => Promise<boolean>;
}

export const useHealthKitSync = (): UseHealthKitSyncReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<HealthKitSyncStatus>({
    isAvailable: Platform.OS === 'ios',
    hasPermissions: false,
    isInitialized: false,
    lastSyncTime: null,
    isSyncing: false,
    error: null,
  });

  // Check HealthKit availability and permissions on mount
  useEffect(() => {
    if (Platform.OS === 'ios' && user) {
      checkHealthKitStatus();
    }
  }, [user]);

  // Set up app state change listener for background sync
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [status.hasPermissions]);

  const checkHealthKitStatus = async () => {
    try {
      const isAvailable = await healthKitService.initialize();
      const permissions = await healthKitService.getPermissionStatus();
      const hasPermissions = Object.values(permissions).some(Boolean);

      setStatus(prev => ({
        ...prev,
        isAvailable,
        hasPermissions,
        isInitialized: isAvailable,
        error: null,
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to check HealthKit status',
      }));
    }
  };

  const initializeHealthKit = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      return false;
    }

    try {
      setStatus(prev => ({ ...prev, error: null }));
      
      const isAvailable = await healthKitService.initialize();
      
      setStatus(prev => ({
        ...prev,
        isAvailable,
        isInitialized: isAvailable,
      }));

      return isAvailable;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to initialize HealthKit',
      }));
      return false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, error: null }));
      
      const hasPermissions = await healthKitService.requestPermissions();
      
      setStatus(prev => ({
        ...prev,
        hasPermissions,
      }));

      if (hasPermissions) {
        // Set up background sync automatically after getting permissions
        await setupBackgroundSync();
        // Initial sync
        await syncNow(7);
      }

      return hasPermissions;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to request HealthKit permissions',
      }));
      return false;
    }
  };

  const syncNow = async (days: number = 7): Promise<boolean> => {
    if (!status.hasPermissions || !user) {
      return false;
    }

    try {
      setStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const success = await healthKitService.syncWithBackend(days);
      
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: success ? new Date() : prev.lastSyncTime,
      }));

      // Invalidate calorie data queries to refresh UI
      if (success) {
        queryClient.invalidateQueries(['unified-calories']);
        queryClient.invalidateQueries(['healthkit-status']);
      }

      return success;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error.message || 'Sync failed',
      }));
      return false;
    }
  };

  const getPermissionStatus = async (): Promise<{ [key: string]: boolean }> => {
    try {
      return await healthKitService.getPermissionStatus();
    } catch (error) {
      console.error('Error getting permission status:', error);
      return {};
    }
  };

  const setupBackgroundSync = async (): Promise<boolean> => {
    if (!status.hasPermissions) {
      return false;
    }

    try {
      const success = await healthKitService.setupBackgroundSync();
      return success;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to setup background sync',
      }));
      return false;
    }
  };

  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && status.hasPermissions && !status.isSyncing) {
      await syncNow(2); // Sync last 2 days when app becomes active
    }
  }, [status.hasPermissions, status.isSyncing]);

  return {
    status,
    initializeHealthKit,
    requestPermissions,
    syncNow,
    getPermissionStatus,
    setupBackgroundSync,
  };
};

// Helper hook for checking HealthKit connection status
export const useHealthKitConnectionStatus = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['healthkit-connection-status', user?.id],
    queryFn: async () => {
      if (Platform.OS !== 'ios' || !user) {
        return { connected: false, lastSync: null };
      }

      try {
        const permissions = await healthKitService.getPermissionStatus();
        const hasPermissions = Object.values(permissions).some(Boolean);
        
        // You could also check for recent data in the database here
        return {
          connected: hasPermissions,
          lastSync: null, // Would come from actual sync tracking
          permissions,
        };
      } catch (error) {
        return { connected: false, lastSync: null, error: error.message };
      }
    },
    enabled: Platform.OS === 'ios' && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};