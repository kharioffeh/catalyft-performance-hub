import { StateCreator, StoreMutatorIdentifier } from 'zustand';
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

const storage = new MMKV({
  id: 'zustand-offline-storage'
});

export const offlineMiddleware = (config: OfflineConfig) => (
  initializer: StateCreator<any, [], [], any>
): StateCreator<any, [], [], any> => (set, get, api) => {
  const storageKey = `zustand-${config.name}`;
  const versionKey = `${storageKey}-version`;
  
  // Initialize the store with offline state
  const baseStore = initializer(set, get, api);
  
  const offlineStore = {
    ...baseStore,
    _hasHydrated: false,
    _pendingSync: 0,
    _lastSync: Date.now(),
    _isOffline: !networkMonitor.isOnline(),
    
    // Hydrate from storage
    hydrate: async () => {
      try {
        const storedData = storage.getString(storageKey);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          set({
            ...parsed,
            _hasHydrated: true
          });
        } else {
          set({ _hasHydrated: true });
        }
      } catch (error) {
        console.error('Failed to hydrate store:', error);
        set({ _hasHydrated: true });
      }
    },
    
    // Persist to storage
    persist: () => {
      const state = get();
      const stateToPersist = config.partialize ? config.partialize(state) : state;
      
      try {
        storage.set(storageKey, JSON.stringify(stateToPersist));
      } catch (error) {
        console.error('Failed to persist store:', error);
      }
    },
    
    // Clear persisted state
    clearPersistedState: () => {
      storage.delete(storageKey);
      storage.delete(versionKey);
    },
    
    // Queue sync operation
    queueSync: async (operation: OperationType, data: any, entityId?: string) => {
      if (!config.entity) return;
      
      const userId = (get() as any).userId || 'anonymous';
      
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
      
      set((state: any) => ({
        ...state,
        _pendingSync: state._pendingSync + 1
      }));
    },
    
    // Process sync queue
    processQueue: async () => {
      if (!config.entity) return;
      
      const userId = (get() as any).userId || 'anonymous';
      const pending = syncQueue.getPendingOperations();
      
      for (const item of pending) {
        try {
          // Process the item
          console.log('Processing sync item:', item);
          set((state: any) => ({
            ...state,
            _pendingSync: Math.max(0, state._pendingSync - 1),
            _lastSync: Date.now()
          }));
        } catch (error) {
          console.error('Failed to process sync item:', error);
        }
      }
    },
    
    // Rollback operation
    rollback: async (operationId: string) => {
      // Implement rollback logic
      console.log('Rolling back operation:', operationId);
    }
  };
  
  // Listen to network changes
  networkMonitor.on('connected', () => {
    set((state: any) => ({ ...state, _isOffline: false }));
    if (config.syncOnReconnect) {
      offlineStore.processQueue();
    }
  });
  
  networkMonitor.on('disconnected', () => {
    set((state: any) => ({ ...state, _isOffline: true }));
  });
  
  // Update pending sync count
  const updatePendingCount = () => {
    const pending = syncQueue.getPendingOperations();
    set((state: any) => ({ ...state, _pendingSync: pending.length }));
  };
  
  // Subscribe to queue changes
  const unsubscribe = syncQueue.subscribe(() => {
    updatePendingCount();
  });
  
  // Auto-hydrate on creation
  if (!(get() as any)._hasHydrated) {
    offlineStore.hydrate();
  }
  
  // Subscribe to state changes for persistence
  api.subscribe((state) => {
    if ((state as any)._hasHydrated) {
      offlineStore.persist();
    }
  });
  
  return offlineStore;
};

// Export types
export type WithOfflineState<T> = T & OfflineState & {
  hydrate: () => void;
  persist: () => void;
  clearPersistedState: () => void;
  queueSync: (operation: OperationType, data: any, entityId?: string) => Promise<void>;
  processQueue: () => Promise<void>;
  rollback: (operationId: string) => Promise<void>;
};