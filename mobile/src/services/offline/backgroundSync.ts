/**
 * Background Sync Service
 * 
 * Note: Background fetch is limited in Expo managed workflow.
 * This implementation provides a timer-based sync when the app is in foreground,
 * and prepares for background sync when ejecting to bare workflow.
 */

import { AppState, AppStateStatus, Platform } from 'react-native';
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
  private syncInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private lastAppState: AppStateStatus = 'active';

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

  // Initialize background sync (timer-based for Expo managed workflow)
  async initialize(customConfig?: Partial<BackgroundSyncConfig>): Promise<void> {
    if (this.isConfigured) {
      console.log('Background sync already configured');
      return;
    }

    this.config = { ...this.config, ...customConfig };

    try {
      // Set up app state listener for foreground/background transitions
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
      
      // Start periodic sync timer (only runs when app is active)
      this.startPeriodicSync();
      
      console.log('[BackgroundSync] Initialized with timer-based sync');
      this.isConfigured = true;
      this.notifyListeners('initialized', { mode: 'timer' });
      
      // Note: For true background sync, you would need to:
      // 1. Eject to bare workflow
      // 2. Use react-native-background-fetch or react-native-background-task
      // 3. Configure native code for iOS and Android
      
    } catch (error) {
      console.error('Failed to initialize background sync:', error);
      throw error;
    }
  }

  // Handle app state changes
  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    console.log(`[BackgroundSync] App state changed: ${this.lastAppState} -> ${nextAppState}`);
    
    if (this.lastAppState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      console.log('[BackgroundSync] App came to foreground, checking for sync...');
      
      // Check if we should sync
      if (await this.shouldSync()) {
        this.performBackgroundSync();
      }
    } else if (nextAppState.match(/inactive|background/) && this.lastAppState === 'active') {
      // App went to background
      console.log('[BackgroundSync] App went to background');
      
      // Stop the periodic sync timer
      this.stopPeriodicSync();
    }
    
    this.lastAppState = nextAppState;
  };

  // Start periodic sync timer
  private startPeriodicSync(): void {
    this.stopPeriodicSync(); // Clear any existing timer
    
    const intervalMs = this.config.minimumFetchInterval * 60 * 1000;
    
    this.syncInterval = setInterval(async () => {
      if (AppState.currentState === 'active' && await this.shouldSync()) {
        console.log('[BackgroundSync] Periodic sync triggered');
        await this.performBackgroundSync();
      }
    }, intervalMs);
    
    console.log(`[BackgroundSync] Periodic sync started (every ${this.config.minimumFetchInterval} minutes)`);
  }

  // Stop periodic sync timer
  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[BackgroundSync] Periodic sync stopped');
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
      console.log('[BackgroundSync] Starting sync...');
      
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

      // 6. Update schedule
      if (syncResult.success) {
        this.schedule.lastSync = Date.now();
        this.schedule.syncCount++;
        this.schedule.failureCount = 0;
      } else {
        this.schedule.failureCount++;
      }
      
      await this.saveSchedule();
      this.notifyListeners('syncComplete', syncResult);

      return syncResult;

    } catch (error) {
      console.error('[BackgroundSync] Sync error:', error);
      this.schedule.failureCount++;
      await this.saveSchedule();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Manual sync trigger
  async triggerSync(): Promise<any> {
    console.log('[BackgroundSync] Manual sync triggered');
    this.notifyListeners('manualSyncStarted');
    
    const result = await this.performBackgroundSync();
    
    return result;
  }

  // Schedule next sync (placeholder for future implementation)
  async scheduleSync(delayMinutes?: number): Promise<void> {
    const delay = delayMinutes || this.schedule.interval;
    this.schedule.nextSync = Date.now() + (delay * 60 * 1000);
    await this.saveSchedule();
    
    console.log(`[BackgroundSync] Next sync scheduled in ${delay} minutes`);
    
    // In a bare workflow, you would schedule an actual background task here
  }

  // Update sync configuration
  async updateConfig(config: Partial<BackgroundSyncConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    // Restart periodic sync with new interval if needed
    if (config.minimumFetchInterval !== undefined && this.isConfigured) {
      this.startPeriodicSync();
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
    backgroundFetchStatus?: string;
  } {
    return {
      config: { ...this.config },
      schedule: { ...this.schedule },
      isConfigured: this.isConfigured,
      backgroundFetchStatus: 'timer-based' // In managed workflow, we use timers
    };
  }

  // Enable/disable background sync
  async setEnabled(enabled: boolean): Promise<void> {
    this.schedule.enabled = enabled;
    await this.saveSchedule();
    
    if (enabled && this.isConfigured) {
      this.startPeriodicSync();
    } else if (!enabled) {
      this.stopPeriodicSync();
    }
    
    this.notifyListeners('enabledChanged', { enabled });
  }

  // Check background fetch status
  async checkStatus(): Promise<string> {
    // In managed workflow, we can only use timer-based sync
    return 'timer-based';
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
    this.stopPeriodicSync();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.syncListeners.clear();
    this.isConfigured = false;
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSyncService();

// Placeholder for iOS app refresh (would be used in bare workflow)
export const handleAppRefresh = async (taskId: string): Promise<void> {
  console.log('[iOS App Refresh] Not available in managed workflow');
};