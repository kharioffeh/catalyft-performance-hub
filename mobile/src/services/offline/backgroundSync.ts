import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { syncEngine } from './syncEngine';
import { networkMonitor } from './networkMonitor';
import { offlineStorage } from './storage';
import { syncQueue } from './syncQueue';

const BACKGROUND_FETCH_TASK = 'catalyft-background-sync';

export interface BackgroundSyncConfig {
  minimumFetchInterval: number; // minutes
  enableHeadless: boolean;
  stopOnTerminate: boolean;
  startOnBoot: boolean;
  requiredNetworkType: 'Any' | 'WiFi' | 'Cellular';
  requiresBatteryNotLow: boolean;
  requiresCharging: boolean;
  requiresDeviceIdle: boolean;
  requiresStorageNotLow: boolean;
  enableForegroundService?: boolean; // Android only
  forceAlarmManager?: boolean; // Android only
}

export interface SyncSchedule {
  enabled: boolean;
  interval: number; // minutes
  wifiOnly: boolean;
  batteryLevel: number; // minimum battery percentage
  lastSync: number;
  nextSync: number;
  syncCount: number;
  failureCount: number;
}

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log('[BackgroundFetch] Task running');
  
  try {
    // Check network status
    if (!networkMonitor.isOnline()) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Perform sync
    const result = await syncEngine.sync({
      direction: 'bidirectional',
      batchSize: 50 // Limit batch size for background sync
    });
    
    if (result.success) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('[BackgroundFetch] Error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundSyncService {
  private config: BackgroundSyncConfig;
  private schedule: SyncSchedule;
  private isConfigured = false;
  private syncListeners: Set<(event: string, data?: any) => void> = new Set();

  constructor() {
    this.config = this.getDefaultConfig();
    this.schedule = this.getDefaultSchedule();
    this.loadSchedule();
  }

  private getDefaultConfig(): BackgroundSyncConfig {
    return {
      minimumFetchInterval: 15, // 15 minutes
      enableHeadless: true,
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: 'Any',
      requiresBatteryNotLow: true,
      requiresCharging: false,
      requiresDeviceIdle: false,
      requiresStorageNotLow: true,
      enableForegroundService: false,
      forceAlarmManager: false
    };
  }

  private getDefaultSchedule(): SyncSchedule {
    return {
      enabled: true,
      interval: 15,
      wifiOnly: false,
      batteryLevel: 20,
      lastSync: 0,
      nextSync: 0,
      syncCount: 0,
      failureCount: 0
    };
  }

  private async loadSchedule(): Promise<void> {
    const saved = await offlineStorage.get<SyncSchedule>('background_sync_schedule');
    if (saved) {
      this.schedule = { ...this.schedule, ...saved };
    }
  }

  private async saveSchedule(): Promise<void> {
    await offlineStorage.set('background_sync_schedule', this.schedule);
  }

  // Initialize background fetch
  async initialize(customConfig?: Partial<BackgroundSyncConfig>): Promise<void> {
    if (this.isConfigured) {
      console.log('Background sync already configured');
      return;
    }

    this.config = { ...this.config, ...customConfig };

    try {
      // Register the background fetch task
      const status = await BackgroundFetch.getStatusAsync();
      console.log('[BackgroundFetch] Status:', status);
      
      if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: this.config.minimumFetchInterval * 60, // Convert to seconds
          stopOnTerminate: this.config.stopOnTerminate,
          startOnBoot: this.config.startOnBoot
        });
        
        console.log('[BackgroundFetch] Task registered successfully');
        this.isConfigured = true;
        this.notifyListeners('initialized', { status });
      } else {
        console.log('[BackgroundFetch] Background fetch is not available');
        this.notifyListeners('unavailable', { status });
      }
    } catch (error) {
      console.error('Failed to initialize background sync:', error);
      throw error;
    }
  }

  // Check if sync should proceed
  private async shouldSync(): Promise<boolean> {
    // Check if enabled
    if (!this.schedule.enabled) {
      return false;
    }

    // Check network conditions
    const networkStatus = networkMonitor.getStatus();
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
      return false;
    }

    // Check WiFi-only requirement
    if (this.schedule.wifiOnly && networkStatus.type !== 'wifi') {
      return false;
    }

    // Check if enough time has passed since last sync
    const timeSinceLastSync = Date.now() - this.schedule.lastSync;
    const minInterval = this.schedule.interval * 60 * 1000; // Convert to ms
    if (timeSinceLastSync < minInterval) {
      return false;
    }

    // Check storage space
    const storageStats = offlineStorage.getStats();
    const storageMB = storageStats.totalSize / (1024 * 1024);
    if (storageMB > 90) { // If cache is > 90MB, clean up first
      await offlineStorage.cleanupExpired();
    }

    return true;
  }

  // Perform the actual background sync
  private async performBackgroundSync(): Promise<any> {
    try {
      // 1. Clean up old data
      const cleanupCount = await offlineStorage.cleanupExpired();
      if (cleanupCount > 0) {
        console.log(`[BackgroundSync] Cleaned up ${cleanupCount} expired items`);
      }

      // 2. Check network quality
      if (!networkMonitor.canSync()) {
        return { success: false, reason: 'Poor network quality' };
      }

      // 3. Process sync queue
      const queueStats = syncQueue.getStats();
      console.log(`[BackgroundSync] Processing ${queueStats.pending} pending operations...`);

      // 4. Perform sync
      const syncResult = await syncEngine.sync({
        direction: 'bidirectional',
        batchSize: 50 // Limit batch size for background sync
      });

      // 5. Handle failed operations
      if (queueStats.failed > 0 && this.schedule.failureCount < 3) {
        console.log(`[BackgroundSync] Retrying ${queueStats.failed} failed operations...`);
        await syncQueue.retryFailed();
      }

      // 6. Update cached data if sync was successful
      if (syncResult.success) {
        await this.updateCachedData();
      }

      return syncResult;

    } catch (error) {
      console.error('[BackgroundSync] Sync error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update cached data after successful sync
  private async updateCachedData(): Promise<void> {
    try {
      // This would fetch fresh data from the server
      // For now, we'll just log
      console.log('[BackgroundSync] Updating cached data...');
      
      // In a real implementation:
      // - Fetch latest workouts
      // - Fetch latest nutrition logs
      // - Update exercise library
      // - Update user preferences
      
    } catch (error) {
      console.error('[BackgroundSync] Error updating cache:', error);
    }
  }

  // Manual sync trigger
  async triggerSync(): Promise<any> {
    console.log('[BackgroundSync] Manual sync triggered');
    this.notifyListeners('manualSyncStarted');
    
    const result = await this.performBackgroundSync();
    
    this.schedule.lastSync = Date.now();
    await this.saveSchedule();
    
    return result;
  }

  // Update sync configuration
  async updateConfig(config: Partial<BackgroundSyncConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    // Reconfigure if already initialized
    if (this.isConfigured) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: this.config.minimumFetchInterval * 60,
        stopOnTerminate: this.config.stopOnTerminate,
        startOnBoot: this.config.startOnBoot
      });
    }
  }

  // Update sync schedule
  async updateSchedule(schedule: Partial<SyncSchedule>): Promise<void> {
    this.schedule = { ...this.schedule, ...schedule };
    await this.saveSchedule();
    
    if (schedule.interval !== undefined && this.isConfigured) {
      await this.updateConfig({ minimumFetchInterval: schedule.interval });
    }
    
    this.notifyListeners('scheduleUpdated', this.schedule);
  }

  // Get sync status
  getStatus(): {
    config: BackgroundSyncConfig;
    schedule: SyncSchedule;
    isConfigured: boolean;
    backgroundFetchStatus?: number;
  } {
    return {
      config: { ...this.config },
      schedule: { ...this.schedule },
      isConfigured: this.isConfigured
    };
  }

  // Enable/disable background sync
  async setEnabled(enabled: boolean): Promise<void> {
    this.schedule.enabled = enabled;
    await this.saveSchedule();
    
    if (enabled && this.isConfigured) {
      // Re-register task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: this.config.minimumFetchInterval * 60,
        stopOnTerminate: this.config.stopOnTerminate,
        startOnBoot: this.config.startOnBoot
      });
    } else if (!enabled && this.isConfigured) {
      // Unregister task
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
    
    this.notifyListeners('enabledChanged', { enabled });
  }

  // Check background fetch status
  async checkStatus(): Promise<number> {
    const status = await BackgroundFetch.getStatusAsync();
    
    switch (status) {
      case BackgroundFetch.BackgroundFetchStatus.Restricted:
        console.log('[BackgroundSync] Status: Restricted');
        break;
      case BackgroundFetch.BackgroundFetchStatus.Denied:
        console.log('[BackgroundSync] Status: Denied');
        break;
      case BackgroundFetch.BackgroundFetchStatus.Available:
        console.log('[BackgroundSync] Status: Available');
        break;
    }
    
    return status;
  }

  // Reset sync data
  async reset(): Promise<void> {
    this.schedule = this.getDefaultSchedule();
    await this.saveSchedule();
    await syncQueue.clearAll();
    this.notifyListeners('reset');
  }

  // Event listeners
  addEventListener(listener: (event: string, data?: any) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifyListeners(event: string, data?: any): void {
    this.syncListeners.forEach(listener => listener(event, data));
  }

  // Get sync history
  async getSyncHistory(): Promise<Array<{
    timestamp: number;
    success: boolean;
    itemsSynced: number;
    duration: number;
  }>> {
    // In a real app, this would be stored in MMKV
    return [];
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.isConfigured) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
    this.syncListeners.clear();
    this.isConfigured = false;
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSyncService();

// iOS specific: Handle app refresh (not needed with Expo)
export const handleAppRefresh = async (taskId: string): Promise<void> {
  console.log('[iOS App Refresh] Task received:', taskId);
  // Expo handles this internally
};