/**
 * Background sync and offline queue management
 */


import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { supabaseService } from './supabase';
import { apiClient } from './api';
import { queryClient } from './queryClient';
import { useStore } from '../store';
import { SyncQueue } from '../types/models';

// Initialize MMKV for offline queue
const queueStorage = new MMKV({
  id: 'offline-queue',
  encryptionKey: 'catalyft-queue-key', // In production, use a secure key
});

// Sync operation types
export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'workout' | 'nutrition' | 'goal' | 'exercise' | 'food';
  entityId?: string;
  data: any;
  userId: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  error?: string;
}

export class BackgroundSyncService {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private appState: AppStateStatus = 'active';
  private netInfoUnsubscribe: (() => void) | null = null;
  private backgroundSyncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  // Initialize background sync service
  private async initialize() {
    // Set up network listener
    this.setupNetworkListener();

    // Set up app state listener
    this.setupAppStateListener();

    // Start sync interval
    this.startSyncInterval();

    // Start background sync simulation
    this.startBackgroundSync();
  }

  // Set up network connectivity listener
  private setupNetworkListener() {
    this.netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;

      useStore.getState().setIsOnline(this.isOnline);

      if (wasOffline && this.isOnline) {
        console.log('Network reconnected, starting sync...');
        this.syncAll();
      }
    });
  }

  // Set up app state listener
  private setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App became active, checking for sync...');
        this.syncAll();
      }
      this.appState = nextAppState;

      // Adjust sync interval based on app state
      if (nextAppState === 'background') {
        this.startBackgroundSync();
      } else if (nextAppState === 'active') {
        this.startSyncInterval();
      }
    });
  }

  // Start periodic sync interval for foreground
  private startSyncInterval() {
    // Clear existing intervals
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
      this.backgroundSyncInterval = null;
    }

    // Sync every 5 minutes when app is active
    this.syncInterval = setInterval(() => {
      if (this.appState === 'active' && this.isOnline) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  // Simulate background sync with longer intervals
  private startBackgroundSync() {
    // Clear existing intervals
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // In background, sync less frequently (every 15 minutes)
    // Note: This will only work while the app is in background, not terminated
    this.backgroundSyncInterval = setInterval(() => {
      if (this.isOnline) {
        console.log('[Background Sync] Running sync task');
        this.syncAll();
      }
    }, 15 * 60 * 1000);
  }

  // Add operation to offline queue
  async addToQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) {
    const queueItem: SyncOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const queue = this.getQueue();
    queue.push(queueItem);
    this.saveQueue(queue);

    console.log('Added to offline queue:', queueItem);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
  }

  // Get offline queue
  private getQueue(): SyncOperation[] {
    const queueStr = queueStorage.getString('queue');
    return queueStr ? JSON.parse(queueStr) : [];
  }

  // Save offline queue
  private saveQueue(queue: SyncOperation[]) {
    queueStorage.set('queue', JSON.stringify(queue));
  }

  // Process offline queue
  async processQueue() {
    if (this.isSyncing || !this.isOnline) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isSyncing = true;
    useStore.getState().setIsSyncing(true);

    console.log(`Processing ${queue.length} queued operations...`);

    // Sort by priority and timestamp
    const sortedQueue = queue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });

    const processedIds: string[] = [];
    const failedOperations: SyncOperation[] = [];

    for (const operation of sortedQueue) {
      try {
        await this.processSyncOperation(operation);
        processedIds.push(operation.id);
        console.log(`Synced operation: ${operation.id}`);
      } catch (error: any) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        
        operation.retryCount++;
        operation.error = error.message;

        if (operation.retryCount < operation.maxRetries) {
          failedOperations.push(operation);
        } else {
          console.error(`Max retries reached for operation ${operation.id}`);
          // Could store permanently failed operations for manual review
          this.storeFailed(operation);
        }
      }
    }

    // Update queue with failed operations
    this.saveQueue(failedOperations);

    this.isSyncing = false;
    useStore.getState().setIsSyncing(false);

    if (processedIds.length > 0) {
      useStore.getState().setLastSyncTime(new Date());
      console.log(`Successfully synced ${processedIds.length} operations`);
    }

    // Invalidate affected queries
    this.invalidateAffectedQueries(sortedQueue.filter(op => 
      processedIds.includes(op.id)
    ));
  }

  // Process individual sync operation
  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.entity) {
      case 'workout':
        await this.syncWorkout(operation);
        break;
      case 'nutrition':
        await this.syncNutrition(operation);
        break;
      case 'goal':
        await this.syncGoal(operation);
        break;
      case 'exercise':
        await this.syncExercise(operation);
        break;
      case 'food':
        await this.syncFood(operation);
        break;
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }

  // Sync workout operation
  private async syncWorkout(operation: SyncOperation) {
    switch (operation.type) {
      case 'create':
        await supabaseService.createWorkout(operation.data);
        break;
      case 'update':
        if (!operation.entityId) throw new Error('Entity ID required for update');
        await supabaseService.updateWorkout(operation.entityId, operation.data);
        break;
      case 'delete':
        if (!operation.entityId) throw new Error('Entity ID required for delete');
        await supabaseService.deleteWorkout(operation.entityId);
        break;
    }
  }

  // Sync nutrition operation
  private async syncNutrition(operation: SyncOperation) {
    switch (operation.type) {
      case 'create':
        await supabaseService.createNutritionEntry(operation.data);
        break;
      case 'update':
        if (!operation.entityId) throw new Error('Entity ID required for update');
        await supabaseService.updateNutritionEntry(operation.entityId, operation.data);
        break;
      case 'delete':
        if (!operation.entityId) throw new Error('Entity ID required for delete');
        await supabaseService.client
          .from('nutrition_entries')
          .delete()
          .eq('id', operation.entityId);
        break;
    }
  }

  // Sync goal operation
  private async syncGoal(operation: SyncOperation) {
    switch (operation.type) {
      case 'create':
        await supabaseService.createGoal(operation.data);
        break;
      case 'update':
        if (!operation.entityId) throw new Error('Entity ID required for update');
        await supabaseService.updateGoal(operation.entityId, operation.data);
        break;
      case 'delete':
        if (!operation.entityId) throw new Error('Entity ID required for delete');
        await supabaseService.client
          .from('goals')
          .delete()
          .eq('id', operation.entityId);
        break;
    }
  }

  // Sync exercise operation
  private async syncExercise(operation: SyncOperation) {
    if (operation.type === 'create') {
      await supabaseService.createExercise(operation.data);
    } else {
      throw new Error(`Unsupported operation type for exercise: ${operation.type}`);
    }
  }

  // Sync food operation
  private async syncFood(operation: SyncOperation) {
    if (operation.type === 'create') {
      await supabaseService.client
        .from('foods')
        .insert(operation.data);
    } else {
      throw new Error(`Unsupported operation type for food: ${operation.type}`);
    }
  }

  // Store permanently failed operations
  private storeFailed(operation: SyncOperation) {
    const failedOps = this.getFailedOperations();
    failedOps.push(operation);
    queueStorage.set('failed-operations', JSON.stringify(failedOps));
  }

  // Get failed operations
  getFailedOperations(): SyncOperation[] {
    const failedStr = queueStorage.getString('failed-operations');
    return failedStr ? JSON.parse(failedStr) : [];
  }

  // Clear failed operations
  clearFailedOperations() {
    queueStorage.delete('failed-operations');
  }

  // Invalidate affected queries after sync
  private invalidateAffectedQueries(operations: SyncOperation[]) {
    const affectedEntities = new Set(operations.map(op => op.entity));
    const userId = operations[0]?.userId;

    if (!userId) return;

    affectedEntities.forEach(entity => {
      switch (entity) {
        case 'workout':
          queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
          break;
        case 'nutrition':
          queryClient.invalidateQueries({ queryKey: ['nutrition', userId] });
          break;
        case 'goal':
          queryClient.invalidateQueries({ queryKey: ['user', userId, 'goals'] });
          break;
        case 'exercise':
          queryClient.invalidateQueries({ queryKey: ['exercises'] });
          break;
        case 'food':
          queryClient.invalidateQueries({ queryKey: ['foods'] });
          break;
      }
    });
  }

  // Sync all data
  async syncAll() {
    if (!this.isOnline || this.isSyncing) return;

    console.log('Starting full sync...');

    try {
      // Process offline queue first
      await this.processQueue();

      // Then sync from server
      const store = useStore.getState();
      if (store.currentUser) {
        await store.syncData();
      }

      console.log('Full sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Export data for backup
  async exportData(): Promise<string> {
    const store = useStore.getState();
    const queue = this.getQueue();
    const failed = this.getFailedOperations();

    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      user: store.currentUser,
      workouts: store.workouts || [],
      todaysFoodLogs: store.todaysFoodLogs || [],
      goals: store.goals,
      queue,
      failed,
    };

    return JSON.stringify(exportData);
  }

  // Import data from backup
  async importData(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate version
      if (data.version !== '1.0') {
        throw new Error('Incompatible backup version');
      }

      // Import queue
      if (data.queue) {
        this.saveQueue(data.queue);
      }

      // Process imported data
      await this.processQueue();

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clean up
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
    }
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();

// Hooks for React components
import { useEffect } from 'react';

export const useBackgroundSync = () => {
  const isOnline = useStore(state => state.isOnline);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    if (isOnline && currentUser) {
      backgroundSyncService.syncAll();
    }
  }, [isOnline, currentUser?.id]);
};

export const useOfflineQueue = () => {
  const addToQueue = (operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    return backgroundSyncService.addToQueue(operation);
  };

  const getQueueSize = () => {
    return backgroundSyncService['getQueue']().length;
  };

  const getFailedOperations = () => {
    return backgroundSyncService.getFailedOperations();
  };

  const retryFailed = () => {
    const failed = backgroundSyncService.getFailedOperations();
    failed.forEach(op => {
      op.retryCount = 0;
      backgroundSyncService.addToQueue(op);
    });
    backgroundSyncService.clearFailedOperations();
  };

  return {
    addToQueue,
    getQueueSize,
    getFailedOperations,
    retryFailed,
  };
};