/**
 * Integration guide for offline support with existing services
 * This file demonstrates how to integrate the offline system with your app
 */

import { networkMonitor } from './networkMonitor';
import { syncQueue } from './syncQueue';
import { offlineStorage } from './storage';
import { syncEngine } from './syncEngine';
import { backgroundSync } from './backgroundSync';
import { cacheManager } from './cacheManager';
import { supabase } from '../supabase';

// ============================================================================
// WORKOUT SERVICE INTEGRATION
// ============================================================================

export class OfflineWorkoutService {
  /**
   * Create a new workout with offline support
   */
  async createWorkout(workoutData: any, userId: string): Promise<any> {
    // Check if online
    if (networkMonitor.isOffline()) {
      // Store locally and queue for sync
      const localWorkout = {
        ...workoutData,
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        synced: false
      };
      
      // Save to local storage
      const workouts = await offlineStorage.getWorkouts(userId) || [];
      workouts.push(localWorkout);
      await offlineStorage.storeWorkouts(workouts, userId);
      
      // Queue for sync
      await syncQueue.add('CREATE', 'workout', localWorkout, userId, {
        priority: 'high'
      });
      
      return localWorkout;
    }
    
    // Online - make API call
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Cache the result
      await cacheManager.set(`workout_${data.id}`, data, 'workouts');
      
      return data;
    } catch (error) {
      // Fallback to offline mode
      console.error('API error, falling back to offline:', error);
      return this.createWorkout(workoutData, userId);
    }
  }

  /**
   * Update an existing workout
   */
  async updateWorkout(workoutId: string, updates: any, userId: string): Promise<any> {
    if (networkMonitor.isOffline()) {
      // Update locally
      const workouts = await offlineStorage.getWorkouts(userId) || [];
      const index = workouts.findIndex(w => w.id === workoutId);
      
      if (index !== -1) {
        workouts[index] = { ...workouts[index], ...updates, updated_at: new Date().toISOString() };
        await offlineStorage.storeWorkouts(workouts, userId);
        
        // Queue for sync
        await syncQueue.add('UPDATE', 'workout', updates, userId, {
          entityId: workoutId,
          priority: 'normal'
        });
        
        return workouts[index];
      }
      
      throw new Error('Workout not found');
    }
    
    // Online - make API call
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', workoutId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update cache
      await cacheManager.set(`workout_${data.id}`, data, 'workouts');
      
      return data;
    } catch (error) {
      console.error('API error, falling back to offline:', error);
      return this.updateWorkout(workoutId, updates, userId);
    }
  }

  /**
   * Get workouts with offline support
   */
  async getWorkouts(userId: string, limit = 30) {
    // Try cache first
    const cached = await offlineStorage.getWorkouts(userId);
    
    if (networkMonitor.isOffline()) {
      return cached || [];
    }
    
    try {
      // Fetch from API
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Update cache
      await offlineStorage.storeWorkouts(data, userId);
      
      return data;
    } catch (error) {
      console.error('API error, using cached data:', error);
      return cached || [];
    }
  }

  /**
   * Delete a workout
   */
  async deleteWorkout(workoutId: string, userId: string): Promise<any> {
    if (networkMonitor.isOffline()) {
      // Mark for deletion locally
      const workouts = await offlineStorage.getWorkouts(userId) || [];
      const filtered = workouts.filter(w => w.id !== workoutId);
      await offlineStorage.storeWorkouts(filtered, userId);
      
      // Queue for sync
      await syncQueue.add('DELETE', 'workout', { id: workoutId }, userId, {
        entityId: workoutId,
        priority: 'low'
      });
      
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
      
      if (error) throw error;
      
      // Remove from cache
      await cacheManager.remove(`workout_${workoutId}`);
      
      return true;
    } catch (error) {
      console.error('API error, falling back to offline:', error);
      return this.deleteWorkout(workoutId, userId);
    }
  }
}

// ============================================================================
// NUTRITION SERVICE INTEGRATION
// ============================================================================

export class OfflineNutritionService {
  /**
   * Log food with offline support
   */
  async logFood(foodData: any, userId: string): Promise<any> {
    if (networkMonitor.isOffline()) {
      const localLog = {
        ...foodData,
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        synced: false
      };
      
      const logs = await offlineStorage.getNutritionLogs(userId) || [];
      logs.push(localLog);
      await offlineStorage.storeNutritionLogs(logs, userId);
      
      await syncQueue.add('CREATE', 'food_log', localLog, userId, {
        priority: 'normal'
      });
      
      return localLog;
    }
    
    try {
      const { data, error } = await supabase
        .from('food_logs')
        .insert(foodData)
        .select()
        .single();
      
      if (error) throw error;
      
      await cacheManager.set(`food_log_${data.id}`, data, 'nutrition');
      
      return data;
    } catch (error) {
      console.error('API error, falling back to offline:', error);
      return this.logFood(foodData, userId);
    }
  }

  /**
   * Search foods with offline fallback
   */
  async searchFoods(query: string, userId: string) {
    // Check frequent foods cache first
    const frequentFoods = await offlineStorage.getFrequentFoods(userId);
    
    if (networkMonitor.isOffline()) {
      // Search in cached foods only
      if (!frequentFoods) return [];
      
      return frequentFoods.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    try {
      // Search API
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Search error, using cached foods:', error);
      if (!frequentFoods) return [];
      
      return frequentFoods.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }
}

// ============================================================================
// ZUSTAND STORE INTEGRATION
// ============================================================================

import { create } from 'zustand';
import { offlineMiddleware, WithOfflineState } from '../../store/middleware/offlineMiddleware';

interface WorkoutState {
  workouts: any[];
  currentWorkout: any | null;
  userId: string | null;
  
  // Actions
  setWorkouts: (workouts: any[]) => void;
  addWorkout: (workout: any) => void;
  updateWorkout: (id: string, updates: any) => void;
  deleteWorkout: (id: string) => void;
  setCurrentWorkout: (workout: any | null) => void;
}

export const useOfflineWorkoutStore = create<WithOfflineState<WorkoutState>>(
  offlineMiddleware(
    (set, get) => ({
      workouts: [],
      currentWorkout: null,
      userId: null,
      
      setWorkouts: (workouts) => set({ workouts }),
      
      addWorkout: (workout) => set((state) => ({
        workouts: [...state.workouts, workout]
      })),
      
      updateWorkout: (id, updates) => set((state) => ({
        workouts: state.workouts.map(w => 
          w.id === id ? { ...w, ...updates } : w
        )
      })),
      
      deleteWorkout: (id) => set((state) => ({
        workouts: state.workouts.filter(w => w.id !== id)
      })),
      
      setCurrentWorkout: (workout) => set({ currentWorkout: workout }),
      
      // Offline state (added by middleware)
      _hasHydrated: false,
      _pendingSync: 0,
      _lastSync: Date.now(),
      _isOffline: false
    }),
    {
      name: 'workout-store',
      entity: 'workout',
      syncOnReconnect: true,
      optimisticUpdates: true,
      persistKeys: ['workouts', 'currentWorkout'],
      version: 1
    }
  )
);

// ============================================================================
// APP INITIALIZATION
// ============================================================================

export async function initializeOfflineSupport() {
  console.log('Initializing offline support...');
  
  // 1. Start network monitoring
  await networkMonitor.checkConnection();
  
  // 2. Initialize background sync
  await backgroundSync.initialize({
    minimumFetchInterval: 15,
    enableHeadless: true,
    stopOnTerminate: false,
    startOnBoot: true,
    requiredNetworkType: 'Any',
    requiresBatteryNotLow: true
  });
  
  // 3. Clean up expired cache
  await cacheManager.cleanup();
  
  // 4. Process any pending sync operations
  if (networkMonitor.isOnline()) {
    await syncEngine.sync();
  }
  
  // 5. Set up event listeners
  networkMonitor.on('connected', async () => {
    console.log('Device connected, starting sync...');
    await syncEngine.sync();
  });
  
  networkMonitor.on('disconnected', () => {
    console.log('Device disconnected, entering offline mode');
  });
  
  // 6. Set up periodic sync
  setInterval(async () => {
    if (networkMonitor.canSync()) {
      const stats = syncQueue.getStats();
      if (stats.pending > 0) {
        console.log(`Processing ${stats.pending} pending operations...`);
        await syncEngine.sync();
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
  
  console.log('Offline support initialized successfully');
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useEffect, useState } from 'react';

/**
 * Hook to monitor network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(networkMonitor.isOnline());
  const [connectionType, setConnectionType] = useState(networkMonitor.getConnectionType());
  const [connectionQuality, setConnectionQuality] = useState(networkMonitor.getConnectionQuality());

  useEffect(() => {
    const handleStatusChange = (status: any) => {
      setIsOnline(status.isConnected && status.isInternetReachable);
      setConnectionType(status.type);
      setConnectionQuality(status.quality);
    };

    networkMonitor.on('status', handleStatusChange);
    
    return () => {
      networkMonitor.off('status', handleStatusChange);
    };
  }, []);

  return { isOnline, connectionType, connectionQuality };
}

/**
 * Hook to monitor sync status
 */
export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const stats = syncQueue.getStats();
      setPendingCount(stats.pending);
      setIsSyncing(stats.syncing > 0);
    };

    const unsubscribe = syncQueue.subscribe(updateStatus);
    
    const unsubscribeSync = syncEngine.onSync((result) => {
      setLastSync(result.timestamp);
      setIsSyncing(false);
    });

    updateStatus();

    return () => {
      unsubscribe();
      unsubscribeSync();
    };
  }, []);

  return { pendingCount, isSyncing, lastSync };
}

/**
 * Hook for offline-first data fetching
 */
export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    refreshInterval?: number;
    cacheFirst?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try cache first if specified or offline
        if (options?.cacheFirst || !isOnline) {
          const cached = await cacheManager.get<T>(key, 'data');
          if (cached) {
            setData(cached);
            setLoading(false);
            
            // If online and cache-first, still fetch fresh data
            if (isOnline && options?.cacheFirst) {
              fetcher().then(fresh => {
                setData(fresh);
                cacheManager.set(key, fresh, 'data');
              }).catch(console.error);
            }
            return;
          }
        }

        // Fetch fresh data
        if (isOnline) {
          const fresh = await fetcher();
          setData(fresh);
          await cacheManager.set(key, fresh, 'data');
        } else {
          throw new Error('Offline and no cached data available');
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up refresh interval if specified
    if (options?.refreshInterval && isOnline) {
      const interval = setInterval(loadData, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [key, isOnline]);

  return { data, loading, error, refetch: () => fetcher() };
}

// ============================================================================
// EXAMPLE USAGE IN COMPONENTS
// ============================================================================

/**
 * Example: Workout Screen with offline support
 */
export const ExampleWorkoutScreen = () => {
  const { isOnline } = useNetworkStatus();
  const { pendingCount } = useSyncStatus();
  const store = useOfflineWorkoutStore();
  const workoutService = new OfflineWorkoutService();

  const handleCreateWorkout = async (data: any) => {
    // Optimistic update
    const tempWorkout = { ...data, id: `temp_${Date.now()}` };
    store.addWorkout(tempWorkout);

    try {
      const workout = await workoutService.createWorkout(data, store.userId!);
      
      // Replace temp with real
      store.updateWorkout(tempWorkout.id, workout);
    } catch (error) {
      // Rollback on error
      store.deleteWorkout(tempWorkout.id);
      console.error('Failed to create workout:', error);
    }
  };

  return {
    // Component JSX would go here
    // Shows offline banner when offline
    // Shows sync status
    // Works seamlessly offline
  };
};