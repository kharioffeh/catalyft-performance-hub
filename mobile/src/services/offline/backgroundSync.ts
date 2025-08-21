import BackgroundFetch from 'react-native-background-fetch';
import { Platform } from 'react-native';
import { syncEngine } from './syncEngine';
import { networkMonitor } from './networkMonitor';
import { offlineStorage } from './storage';
import { syncQueue } from './syncQueue';

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
      // Configure BackgroundFetch
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: this.config.minimumFetchInterval,
          enableHeadless: this.config.enableHeadless,
          stopOnTerminate: this.config.stopOnTerminate,
          startOnBoot: this.config.startOnBoot,
          requiredNetworkType: this.mapNetworkType(this.config.requiredNetworkType),
          requiresBatteryNotLow: this.config.requiresBatteryNotLow,
          requiresCharging: this.config.requiresCharging,
          requiresDeviceIdle: this.config.requiresDeviceIdle,
          requiresStorageNotLow: this.config.requiresStorageNotLow,
          // Android specific
          ...(Platform.OS === 'android' && {
            enableForegroundService: this.config.enableForegroundService,
            forceAlarmManager: this.config.forceAlarmManager
          })
        },
        async (taskId) => {
          console.log('[BackgroundFetch] Task received:', taskId);
          await this.onBackgroundFetch(taskId);
        },
        async (taskId) => {
          console.log('[BackgroundFetch] Task timeout:', taskId);
          BackgroundFetch.finish(taskId);
        }
      );

      console.log('[BackgroundFetch] Status:', status);

      // Register headless task for Android
      if (Platform.OS === 'android' && this.config.enableHeadless) {
        BackgroundFetch.registerHeadlessTask(async (event) => {
          console.log('[BackgroundFetch Headless] Task received:', event.taskId);
          await this.onBackgroundFetch(event.taskId, true);
        });
      }

      // Schedule initial sync
      await this.scheduleSync();

      this.isConfigured = true;
      this.notifyListeners('initialized', { status });

    } catch (error) {
      console.error('Failed to initialize background sync:', error);
      throw error;
    }
  }

  // Handle background fetch event
  private async onBackgroundFetch(taskId: string, isHeadless = false): Promise<void> {
    console.log(`[BackgroundSync] Starting sync (${isHeadless ? 'headless' : 'normal'})...`);
    
    const startTime = Date.now();
    let success = false;

    try {
      // Check if sync should proceed
      if (!await this.shouldSync()) {
        console.log('[BackgroundSync] Sync conditions not met, skipping...');
        BackgroundFetch.finish(taskId);
        return;
      }

      // Perform sync
      const result = await this.performBackgroundSync();
      success = result.success;

      // Update schedule
      this.schedule.lastSync = Date.now();
      this.schedule.syncCount++;
      
      if (success) {
        this.schedule.failureCount = 0;
        console.log('[BackgroundSync] Sync completed successfully');
      } else {
        this.schedule.failureCount++;
        console.log('[BackgroundSync] Sync failed');
      }

      await this.saveSchedule();
      this.notifyListeners('syncComplete', result);

    } catch (error) {
      console.error('[BackgroundSync] Error during sync:', error);
      this.schedule.failureCount++;
      await this.saveSchedule();
      this.notifyListeners('syncError', { error });
    } finally {
      const duration = Date.now() - startTime;
      console.log(`[BackgroundSync] Finished in ${duration}ms`);
      
      // Must call finish to signal completion
      BackgroundFetch.finish(taskId);
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

    // Check battery level (would need react-native-device-info in real app)
    // For now, we'll assume battery is OK

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

  // Schedule next sync
  async scheduleSync(delayMinutes?: number): Promise<void> {
    const delay = delayMinutes || this.schedule.interval;
    this.schedule.nextSync = Date.now() + (delay * 60 * 1000);
    await this.saveSchedule();

    // On iOS, we can schedule a specific task
    if (Platform.OS === 'ios') {
      try {
        await BackgroundFetch.scheduleTask({
          taskId: 'com.catalyft.sync',
          delay: delay * 60 * 1000, // Convert to milliseconds
          periodic: false,
          stopOnTerminate: false,
          enableHeadless: true
        });
        console.log(`[BackgroundSync] Scheduled sync in ${delay} minutes`);
      } catch (error) {
        console.error('[BackgroundSync] Failed to schedule task:', error);
      }
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
      await BackgroundFetch.configure(
        {
          minimumFetchInterval: this.config.minimumFetchInterval,
          requiredNetworkType: this.mapNetworkType(this.config.requiredNetworkType),
          requiresBatteryNotLow: this.config.requiresBatteryNotLow,
          requiresCharging: this.config.requiresCharging,
          requiresDeviceIdle: this.config.requiresDeviceIdle,
          requiresStorageNotLow: this.config.requiresStorageNotLow
        },
        async (taskId) => {
          await this.onBackgroundFetch(taskId);
        },
        async (taskId) => {
          BackgroundFetch.finish(taskId);
        }
      );
    }
  }

  // Update sync schedule
  async updateSchedule(schedule: Partial<SyncSchedule>): Promise<void> {
    this.schedule = { ...this.schedule, ...schedule };
    await this.saveSchedule();
    
    if (schedule.interval !== undefined) {
      await this.scheduleSync();
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
      isConfigured: this.isConfigured,
      backgroundFetchStatus: BackgroundFetch.status
    };
  }

  // Enable/disable background sync
  async setEnabled(enabled: boolean): Promise<void> {
    this.schedule.enabled = enabled;
    await this.saveSchedule();
    
    if (enabled) {
      await BackgroundFetch.start();
      await this.scheduleSync();
    } else {
      await BackgroundFetch.stop();
    }
    
    this.notifyListeners('enabledChanged', { enabled });
  }

  // Check background fetch status
  async checkStatus(): Promise<number> {
    const status = await BackgroundFetch.status;
    
    switch (status) {
      case BackgroundFetch.STATUS_RESTRICTED:
        console.log('[BackgroundSync] Status: Restricted');
        break;
      case BackgroundFetch.STATUS_DENIED:
        console.log('[BackgroundSync] Status: Denied');
        break;
      case BackgroundFetch.STATUS_AVAILABLE:
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

  // Helper to map network type
  private mapNetworkType(type: string): number {
    switch (type) {
      case 'WiFi':
        return BackgroundFetch.NETWORK_TYPE_UNMETERED;
      case 'Cellular':
        return BackgroundFetch.NETWORK_TYPE_CELLULAR;
      case 'Any':
      default:
        return BackgroundFetch.NETWORK_TYPE_ANY;
    }
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
    await BackgroundFetch.stop();
    this.syncListeners.clear();
    this.isConfigured = false;
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSyncService();

// iOS specific: Handle app refresh
export const handleAppRefresh = async (taskId: string): Promise<void> {
  console.log('[iOS App Refresh] Task received:', taskId);
  
  try {
    const result = await backgroundSync.triggerSync();
    console.log('[iOS App Refresh] Sync result:', result);
  } catch (error) {
    console.error('[iOS App Refresh] Error:', error);
  } finally {
    BackgroundFetch.finish(taskId);
  }
};