/**
 * Export all services for easy import
 */

// API services
export { api, apiClient, TokenManager, ApiError, OfflineQueue } from './api';
export type { ApiRequestConfig, ApiResponse } from './api';

// Supabase services
export { supabase, supabaseService, SupabaseService } from './supabase';

// Query client and React Query utilities
export { 
  queryClient, 
  queryKeys, 
  optimisticUpdates, 
  prefetchHelpers,
  invalidateHelpers,
  mmkvPersister 
} from './queryClient';

// Real-time services
export { 
  realtimeService, 
  RealtimeService,
  useRealtime,
  useChallengeRealtime,
  usePresence 
} from './realtime';

// Background sync services
export { 
  backgroundSyncService, 
  BackgroundSyncService,
  useBackgroundSync,
  useOfflineQueue 
} from './backgroundSync';
export type { SyncOperation } from './backgroundSync';