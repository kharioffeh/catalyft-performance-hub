import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { offlineStorage } from '../../services/offline/storage';
import { syncQueue } from '../../services/offline/syncQueue';
import { networkMonitor } from '../../services/offline/networkMonitor';
import { EntityType, OperationType } from '../../services/offline/syncQueue';

export interface OfflineConfig {
  name: string;
  entity?: EntityType;
  syncOnReconnect?: boolean;
  optimisticUpdates?: boolean;
  persistKeys?: string[];
  excludeKeys?: string[];
  version?: number;
  migrate?: (persistedState: any, version: number) => any;
  partialize?: (state: any) => any;
}

export interface OfflineState {
  _hasHydrated: boolean;
  _pendingSync: number;
  _lastSync: number;
  _isOffline: boolean;
}

type OfflineMiddleware = <
  T extends OfflineState,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  initializer: StateCreator<T, Mps, Mcs, T>,
  config: OfflineConfig
) => StateCreator<T, Mps, Mcs, T>;

const storage = new MMKV({
  id: 'zustand-offline-storage'
});

export const offlineMiddleware: OfflineMiddleware = (initializer, config) => {
  return (set, get, api) => {
    const storageKey = `zustand-${config.name}`;
    const versionKey = `${storageKey}-version`;
    
    // Track mutations for sync
    const trackedMutations = new Map<string, any>();
    let syncTimeout: NodeJS.Timeout | null = null;

    // Initialize offline state
    const offlineState: OfflineState = {
      _hasHydrated: false,
      _pendingSync: 0,
      _lastSync: Date.now(),
      _isOffline: !networkMonitor.isOnline()
    };

    // Hydrate from storage
    const hydrate = () => {
      try {
        const storedVersion = storage.getNumber(versionKey) || 1;
        const storedState = storage.getString(storageKey);
        
        if (storedState) {
          let parsedState = JSON.parse(storedState);
          
          // Handle migration if needed
          if (config.version && config.version !== storedVersion && config.migrate) {
            parsedState = config.migrate(parsedState, storedVersion);
            storage.set(versionKey, config.version);
          }
          
          // Apply partialize if defined
          if (config.partialize) {
            parsedState = config.partialize(parsedState);
          }
          
          set({
            ...parsedState,
            _hasHydrated: true
          } as T);
        } else {
          set({ _hasHydrated: true } as Partial<T>);
        }
      } catch (error) {
        console.error('Error hydrating state:', error);
        set({ _hasHydrated: true } as Partial<T>);
      }
    };

    // Persist to storage
    const persist = (state: T) => {
      try {
        let stateToPersist = state;
        
        // Apply partialize if defined
        if (config.partialize) {
          stateToPersist = config.partialize(state);
        }
        
        // Filter keys if specified
        if (config.persistKeys) {
          const filtered: any = {};
          for (const key of config.persistKeys) {
            if (key in stateToPersist) {
              filtered[key] = stateToPersist[key as keyof T];
            }
          }
          stateToPersist = filtered;
        }
        
        // Exclude keys if specified
        if (config.excludeKeys) {
          const filtered = { ...stateToPersist };
          for (const key of config.excludeKeys) {
            delete filtered[key as keyof T];
          }
          stateToPersist = filtered as T;
        }
        
        storage.set(storageKey, JSON.stringify(stateToPersist));
        
        if (config.version) {
          storage.set(versionKey, config.version);
        }
      } catch (error) {
        console.error('Error persisting state:', error);
      }
    };

    // Queue sync operation
    const queueSync = async (operation: OperationType, data: any, entityId?: string) => {
      if (!config.entity) return;
      
      const userId = get().userId || 'anonymous'; // Assuming userId is in state
      
      await syncQueue.add(
        operation,
        config.entity,
        data,
        userId,
        {
          entityId,
          priority: 'normal'
        }
      );
      
      set((state) => ({
        ...state,
        _pendingSync: (state._pendingSync || 0) + 1
      } as T));
    };

    // Handle optimistic updates
    const handleOptimisticUpdate = (
      operation: OperationType,
      data: any,
      rollbackData?: any
    ) => {
      if (!config.optimisticUpdates) return;
      
      // Store rollback data
      const operationId = Date.now().toString();
      trackedMutations.set(operationId, {
        operation,
        data,
        rollbackData,
        timestamp: Date.now()
      });
      
      // Clear old mutations (older than 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      for (const [id, mutation] of trackedMutations.entries()) {
        if (mutation.timestamp < fiveMinutesAgo) {
          trackedMutations.delete(id);
        }
      }
      
      return operationId;
    };

    // Rollback optimistic update
    const rollbackOptimisticUpdate = (operationId: string) => {
      const mutation = trackedMutations.get(operationId);
      if (!mutation || !mutation.rollbackData) return;
      
      set(mutation.rollbackData);
      trackedMutations.delete(operationId);
    };

    // Enhanced set function with offline support
    const offlineSet: typeof set = (partial, replace) => {
      const previousState = get();
      
      // Apply the update
      set(partial, replace);
      
      const newState = get();
      
      // Persist to storage
      persist(newState);
      
      // Detect changes and queue sync if needed
      if (networkMonitor.isOffline() && config.entity) {
        detectAndQueueChanges(previousState, newState);
      }
      
      // Schedule sync if online and changes detected
      if (networkMonitor.isOnline() && config.syncOnReconnect) {
        scheduleSyncDebounced();
      }
    };

    // Detect changes and queue them
    const detectAndQueueChanges = (oldState: T, newState: T) => {
      // Skip if no entity configured
      if (!config.entity) return;
      
      // Compare states and detect changes
      const changes = detectChanges(oldState, newState);
      
      for (const change of changes) {
        queueSync(change.type, change.data, change.entityId);
      }
    };

    // Detect specific changes between states
    const detectChanges = (oldState: any, newState: any): Array<{
      type: OperationType;
      data: any;
      entityId?: string;
    }> => {
      const changes: Array<{ type: OperationType; data: any; entityId?: string }> = [];
      
      // Example: Detect workout changes
      if (config.entity === 'workout') {
        if (oldState.workouts && newState.workouts) {
          // Check for new workouts
          const oldIds = new Set(oldState.workouts.map((w: any) => w.id));
          const newWorkouts = newState.workouts.filter((w: any) => !oldIds.has(w.id));
          
          for (const workout of newWorkouts) {
            changes.push({
              type: 'CREATE',
              data: workout,
              entityId: workout.id
            });
          }
          
          // Check for updated workouts
          for (const newWorkout of newState.workouts) {
            const oldWorkout = oldState.workouts.find((w: any) => w.id === newWorkout.id);
            if (oldWorkout && JSON.stringify(oldWorkout) !== JSON.stringify(newWorkout)) {
              changes.push({
                type: 'UPDATE',
                data: newWorkout,
                entityId: newWorkout.id
              });
            }
          }
          
          // Check for deleted workouts
          const newIds = new Set(newState.workouts.map((w: any) => w.id));
          const deletedWorkouts = oldState.workouts.filter((w: any) => !newIds.has(w.id));
          
          for (const workout of deletedWorkouts) {
            changes.push({
              type: 'DELETE',
              data: { id: workout.id },
              entityId: workout.id
            });
          }
        }
      }
      
      // Add similar logic for other entities...
      
      return changes;
    };

    // Schedule sync with debouncing
    const scheduleSyncDebounced = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
      
      syncTimeout = setTimeout(async () => {
        await performSync();
      }, 5000); // 5 second debounce
    };

    // Perform sync
    const performSync = async () => {
      if (!networkMonitor.isOnline()) return;
      
      try {
        // Process pending sync operations
        const pendingOps = syncQueue.getPendingOperations();
        const relevantOps = config.entity 
          ? pendingOps.filter(op => op.entity === config.entity)
          : pendingOps;
        
        if (relevantOps.length > 0) {
          // Sync operations will be handled by syncEngine
          set((state) => ({
            ...state,
            _pendingSync: relevantOps.length,
            _lastSync: Date.now()
          } as T));
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    // Listen to network changes
    networkMonitor.on('connected', () => {
      set((state) => ({ ...state, _isOffline: false } as T));
      
      if (config.syncOnReconnect) {
        performSync();
      }
    });

    networkMonitor.on('disconnected', () => {
      set((state) => ({ ...state, _isOffline: true } as T));
    });

    // Listen to sync queue changes
    const unsubscribeQueue = syncQueue.subscribe((queue) => {
      const pendingCount = queue.filter(op => op.status === 'pending').length;
      set((state) => ({ ...state, _pendingSync: pendingCount } as T));
    });

    // Create the store with offline enhancements
    const store = initializer(offlineSet, get, api);

    // Add offline-specific methods
    const offlineStore = {
      ...store,
      ...offlineState,
      
      // Hydrate from storage
      hydrate,
      
      // Manual persist
      persist: () => persist(get()),
      
      // Clear persisted state
      clearPersistedState: () => {
        storage.delete(storageKey);
        storage.delete(versionKey);
      },
      
      // Queue sync manually
      queueSync,
      
      // Handle optimistic updates
      optimisticUpdate: handleOptimisticUpdate,
      rollback: rollbackOptimisticUpdate,
      
      // Force sync
      forceSync: performSync,
      
      // Get sync status
      getSyncStatus: () => ({
        pendingSync: get()._pendingSync || 0,
        lastSync: get()._lastSync || 0,
        isOffline: get()._isOffline || false
      }),
      
      // Cleanup
      destroy: () => {
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
        unsubscribeQueue();
      }
    };

    // Auto-hydrate on creation
    setTimeout(() => {
      if (!get()._hasHydrated) {
        hydrate();
      }
    }, 0);

    return offlineStore as T;
  };
};

// Helper to create MMKV storage for zustand persist
export const createMMKVStorage = () => {
  const mmkv = new MMKV({
    id: 'zustand-persist-storage'
  });

  return {
    getItem: (name: string) => {
      const value = mmkv.getString(name);
      return value ?? null;
    },
    setItem: (name: string, value: string) => {
      mmkv.set(name, value);
    },
    removeItem: (name: string) => {
      mmkv.delete(name);
    }
  };
};

// Type helper for stores with offline support
export type WithOfflineState<T> = T & OfflineState & {
  hydrate: () => void;
  persist: () => void;
  clearPersistedState: () => void;
  queueSync: (operation: OperationType, data: any, entityId?: string) => Promise<void>;
  optimisticUpdate: (operation: OperationType, data: any, rollbackData?: any) => string;
  rollback: (operationId: string) => void;
  forceSync: () => Promise<void>;
  getSyncStatus: () => {
    pendingSync: number;
    lastSync: number;
    isOffline: boolean;
  };
  destroy: () => void;
};