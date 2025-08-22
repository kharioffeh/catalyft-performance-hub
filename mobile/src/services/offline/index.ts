/**
 * Offline Support and Data Synchronization Module
 * 
 * This module provides comprehensive offline functionality for the Catalyft fitness app,
 * ensuring users can continue their workouts and nutrition tracking without internet.
 */

// Core Services
export { offlineStorage, OfflineStorage } from './storage';
export { syncQueue, SyncQueue } from './syncQueue';
export { networkMonitor, NetworkMonitor } from './networkMonitor';
export { syncEngine, SyncEngine } from './syncEngine';
export { backgroundSync, BackgroundSyncService } from './backgroundSync';
export { cacheManager, CacheManager } from './cacheManager';

// Integration
export {
  OfflineWorkoutService,
  OfflineNutritionService,
  createOfflineWorkoutStore,
  useNetworkStatus,
  useSyncStatus
} from './integration';

// Types
export type {
  SyncOperation,
  OperationType,
  EntityType,
  SyncStatus,
  Priority,
  QueueStats,
} from './syncQueue';

export type {
  NetworkStatus,
  ConnectionQuality,
  ConnectionType,
  NetworkConfig,
} from './networkMonitor';

export type {
  SyncConflict,
  SyncResult,
  SyncOptions,
  ConflictResolutionStrategy,
  SyncDirection,
  EntitySyncConfig,
} from './syncEngine';

export type {
  BackgroundSyncConfig,
  SyncSchedule,
} from './backgroundSync';

export type {
  StorageConfig,
  CachedItem,
  StorageStats,
} from './storage';

export type {
  CachePolicy,
  CacheEntry,
  CacheStats,
  CachePreferences,
} from './cacheManager';

// Middleware
export { 
  offlineMiddleware,
  type OfflineConfig,
  type OfflineState,
  type WithOfflineState
} from '../../store/middleware/offlineMiddleware';

// UI Components
export { SyncStatusBar } from '../../components/sync/SyncStatusBar';
export { OfflineBanner } from '../../components/sync/OfflineBanner';
export { SyncDetailsModal } from '../../components/sync/SyncDetailsModal';
export { ConflictResolutionScreen } from '../../screens/sync/ConflictResolutionScreen';

/**
 * Quick Start Guide:
 * 
 * 1. Initialize in your App.tsx:
 * ```typescript
 * import { initializeOfflineSupport } from '@/services/offline';
 * 
 * useEffect(() => {
 *   initializeOfflineSupport();
 * }, []);
 * ```
 * 
 * 2. Add sync status to your main layout:
 * ```typescript
 * import { SyncStatusBar, OfflineBanner } from '@/services/offline';
 * 
 * <View>
 *   <OfflineBanner />
 *   <SyncStatusBar />
 *   {children}
 * </View>
 * ```
 * 
 * 3. Use offline-enabled services:
 * ```typescript
 * import { OfflineWorkoutService } from '@/services/offline';
 * 
 * const workoutService = new OfflineWorkoutService();
 * const workout = await workoutService.createWorkout(data, userId);
 * ```
 * 
 * 4. Create offline-enabled stores:
 * ```typescript
 * import { offlineMiddleware } from '@/services/offline';
 * 
 * const useStore = create(
 *   offlineMiddleware(
 *     (set, get) => ({ ... }),
 *     { name: 'my-store', entity: 'workout' }
 *   )
 * );
 * ```
 */

// Constants
export const OFFLINE_CONFIG = {
  MAX_CACHE_SIZE: 100, // MB
  MAX_QUEUE_SIZE: 1000,
  SYNC_INTERVAL: 15, // minutes
  CACHE_EXPIRY: 30, // days
  NETWORK_CHECK_INTERVAL: 30, // seconds
  BACKGROUND_SYNC_INTERVAL: 15, // minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
} as const;

// Feature flags
export const OFFLINE_FEATURES = {
  WORKOUTS: true,
  NUTRITION: true,
  RECIPES: true,
  EXERCISES: true,
  TEMPLATES: true,
  GOALS: true,
  WATER_TRACKING: true,
  BACKGROUND_SYNC: true,
  AUTO_CONFLICT_RESOLUTION: true,
  CACHE_COMPRESSION: true,
  CACHE_ENCRYPTION: true,
} as const;

// Error messages
export const OFFLINE_ERRORS = {
  NO_CONNECTION: 'No internet connection. Your changes will sync when you reconnect.',
  SYNC_FAILED: 'Failed to sync data. Will retry automatically.',
  CACHE_FULL: 'Local storage is full. Please clear some data.',
  CONFLICT_DETECTED: 'Data conflict detected. Please resolve manually.',
  BACKGROUND_SYNC_DISABLED: 'Background sync is disabled. Enable it for automatic syncing.',
} as const;