import { offlineStorage } from './storage';
import { syncQueue, SyncOperation, EntityType } from './syncQueue';
import { networkMonitor } from './networkMonitor';
import { supabase } from '../supabase'; // Assuming this exists

export type ConflictResolutionStrategy = 'local_wins' | 'remote_wins' | 'merge' | 'manual';
export type SyncDirection = 'push' | 'pull' | 'bidirectional';

export interface SyncConflict {
  id: string;
  entity: EntityType;
  entityId: string;
  localData: any;
  remoteData: any;
  localTimestamp: number;
  remoteTimestamp: number;
  resolution?: ConflictResolutionStrategy;
  resolved: boolean;
  resolvedData?: any;
}

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  conflicts: SyncConflict[];
  errors: string[];
  duration: number;
  timestamp: number;
}

export interface SyncOptions {
  direction?: SyncDirection;
  entities?: EntityType[];
  forceSync?: boolean;
  conflictStrategy?: ConflictResolutionStrategy;
  batchSize?: number;
}

export interface EntitySyncConfig {
  table: string;
  primaryKey: string;
  timestampField: string;
  softDelete: boolean;
  conflictStrategy: ConflictResolutionStrategy;
  mergeableFields?: string[];
}

export class SyncEngine {
  private syncInProgress = false;
  private lastSyncTimestamps: Map<string, number> = new Map();
  private conflicts: SyncConflict[] = [];
  private syncListeners: Set<(result: SyncResult) => void> = new Set();
  
  private entityConfigs: Map<EntityType, EntitySyncConfig> = new Map([
    ['workout', {
      table: 'workouts',
      primaryKey: 'id',
      timestampField: 'updated_at',
      softDelete: true,
      conflictStrategy: 'merge',
      mergeableFields: ['sets', 'exercises']
    }],
    ['food_log', {
      table: 'food_logs',
      primaryKey: 'id',
      timestampField: 'created_at',
      softDelete: false,
      conflictStrategy: 'local_wins',
      mergeableFields: []
    }],
    ['recipe', {
      table: 'recipes',
      primaryKey: 'id',
      timestampField: 'updated_at',
      softDelete: true,
      conflictStrategy: 'manual',
      mergeableFields: ['ingredients', 'instructions']
    }],
    ['water_log', {
      table: 'water_logs',
      primaryKey: 'id',
      timestampField: 'created_at',
      softDelete: false,
      conflictStrategy: 'local_wins',
      mergeableFields: []
    }],
    ['exercise', {
      table: 'exercises',
      primaryKey: 'id',
      timestampField: 'updated_at',
      softDelete: true,
      conflictStrategy: 'remote_wins',
      mergeableFields: []
    }],
    ['template', {
      table: 'workout_templates',
      primaryKey: 'id',
      timestampField: 'updated_at',
      softDelete: true,
      conflictStrategy: 'manual',
      mergeableFields: ['exercises']
    }],
    ['goal', {
      table: 'goals',
      primaryKey: 'id',
      timestampField: 'updated_at',
      softDelete: false,
      conflictStrategy: 'remote_wins',
      mergeableFields: []
    }]
  ]);

  constructor() {
    this.initializeListeners();
    this.loadLastSyncTimestamps();
  }

  private initializeListeners(): void {
    // Listen for network changes
    networkMonitor.on('connected', async () => {
      if (networkMonitor.canSync()) {
        await this.sync();
      }
    });

    // Process sync queue when online
    networkMonitor.on('syncReady', async () => {
      await this.processSyncQueue();
    });
  }

  private async loadLastSyncTimestamps(): Promise<void> {
    const stored = await offlineStorage.get<Record<string, number>>('sync_timestamps');
    if (stored) {
      this.lastSyncTimestamps = new Map(Object.entries(stored));
    }
  }

  private async saveLastSyncTimestamps(): Promise<void> {
    const timestamps = Object.fromEntries(this.lastSyncTimestamps);
    await offlineStorage.set('sync_timestamps', timestamps);
  }

  // Main sync method
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return this.createResult(false, ['Sync already in progress']);
    }

    if (!networkMonitor.isOnline() && !options.forceSync) {
      console.log('Cannot sync: offline');
      return this.createResult(false, ['Device is offline']);
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      pushed: 0,
      pulled: 0,
      conflicts: [],
      errors: [],
      duration: 0,
      timestamp: startTime
    };

    try {
      const direction = options.direction || 'bidirectional';
      const entities = options.entities || Array.from(this.entityConfigs.keys());

      // Process each entity type
      for (const entity of entities) {
        const entityResult = await this.syncEntity(entity, direction, options);
        
        result.pushed += entityResult.pushed;
        result.pulled += entityResult.pulled;
        result.conflicts.push(...entityResult.conflicts);
        result.errors.push(...entityResult.errors);
        
        if (!entityResult.success) {
          result.success = false;
        }
      }

      // Process sync queue if bidirectional or push
      if (direction === 'bidirectional' || direction === 'push') {
        await this.processSyncQueue();
      }

      result.duration = Date.now() - startTime;
      await this.saveLastSyncTimestamps();
      
      this.notifySyncListeners(result);
      return result;

    } catch (error) {
      console.error('Sync error:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.duration = Date.now() - startTime;
      return result;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync individual entity type
  private async syncEntity(
    entity: EntityType,
    direction: SyncDirection,
    options: SyncOptions
  ): Promise<SyncResult> {
    const config = this.entityConfigs.get(entity);
    if (!config) {
      return this.createResult(false, [`No config for entity: ${entity}`]);
    }

    const result = this.createResult(true);
    const userId = await this.getCurrentUserId();
    if (!userId) {
      result.errors.push('No user ID available');
      return result;
    }

    try {
      // Pull changes from server
      if (direction === 'pull' || direction === 'bidirectional') {
        const pullResult = await this.pullChanges(entity, config, userId);
        result.pulled = pullResult.count;
        result.conflicts.push(...pullResult.conflicts);
      }

      // Push changes to server
      if (direction === 'push' || direction === 'bidirectional') {
        const pushResult = await this.pushChanges(entity, config, userId);
        result.pushed = pushResult.count;
        result.errors.push(...pushResult.errors);
      }

      return result;
    } catch (error) {
      console.error(`Error syncing ${entity}:`, error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  // Pull changes from server
  private async pullChanges(
    entity: EntityType,
    config: EntitySyncConfig,
    userId: string
  ): Promise<{ count: number; conflicts: SyncConflict[] }> {
    const lastSync = this.lastSyncTimestamps.get(`${entity}_${userId}`) || 0;
    const conflicts: SyncConflict[] = [];
    let count = 0;

    try {
      // Fetch remote changes since last sync
      const { data: remoteData, error } = await supabase
        .from(config.table)
        .select('*')
        .eq('user_id', userId)
        .gt(config.timestampField, new Date(lastSync).toISOString())
        .order(config.timestampField, { ascending: true });

      if (error) throw error;
      if (!remoteData || remoteData.length === 0) return { count: 0, conflicts: [] };

      // Get local data for comparison
      const localData = await this.getLocalData(entity, userId);
      const localMap = new Map(localData.map(item => [item[config.primaryKey], item]));

      for (const remoteItem of remoteData) {
        const localItem = localMap.get(remoteItem[config.primaryKey]);
        
        if (localItem) {
          // Check for conflict
          const conflict = await this.detectConflict(
            localItem,
            remoteItem,
            config
          );
          
          if (conflict) {
            conflicts.push({
              id: `${entity}_${remoteItem[config.primaryKey]}`,
              entity,
              entityId: remoteItem[config.primaryKey],
              localData: localItem,
              remoteData: remoteItem,
              localTimestamp: new Date(localItem[config.timestampField]).getTime(),
              remoteTimestamp: new Date(remoteItem[config.timestampField]).getTime(),
              resolved: false
            });
          } else {
            // No conflict, update local
            await this.updateLocalData(entity, remoteItem, userId);
            count++;
          }
        } else {
          // New item from server
          await this.saveLocalData(entity, remoteItem, userId);
          count++;
        }
      }

      // Handle conflicts
      if (conflicts.length > 0) {
        await this.handleConflicts(conflicts, config.conflictStrategy);
      }

      // Update last sync timestamp
      const latestTimestamp = Math.max(
        ...remoteData.map(item => new Date(item[config.timestampField]).getTime())
      );
      this.lastSyncTimestamps.set(`${entity}_${userId}`, latestTimestamp);

      return { count, conflicts };
    } catch (error) {
      console.error('Pull changes error:', error);
      throw error;
    }
  }

  // Push changes to server
  private async pushChanges(
    entity: EntityType,
    config: EntitySyncConfig,
    userId: string
  ): Promise<{ count: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Get pending operations from sync queue
      const operations = syncQueue.getOperationsByEntity(entity, userId);
      
      for (const operation of operations) {
        try {
          const success = await this.executeSyncOperation(operation, config);
          if (success) {
            syncQueue.updateOperation({ ...operation, status: 'completed' });
            count++;
          } else {
            throw new Error('Operation failed');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync ${entity} ${operation.id}: ${errorMsg}`);
          
          // Update operation status
          syncQueue.updateOperation({
            ...operation,
            status: 'failed',
            error: errorMsg,
            retryCount: operation.retryCount + 1
          });
        }
      }

      return { count, errors };
    } catch (error) {
      console.error('Push changes error:', error);
      throw error;
    }
  }

  // Execute individual sync operation
  private async executeSyncOperation(
    operation: SyncOperation,
    config: EntitySyncConfig
  ): Promise<boolean> {
    try {
      switch (operation.type) {
        case 'CREATE':
          const { error: createError } = await supabase
            .from(config.table)
            .insert(operation.data);
          return !createError;

        case 'UPDATE':
          const { error: updateError } = await supabase
            .from(config.table)
            .update(operation.data)
            .eq(config.primaryKey, operation.entityId);
          return !updateError;

        case 'DELETE':
          if (config.softDelete) {
            const { error: softDeleteError } = await supabase
              .from(config.table)
              .update({ deleted_at: new Date().toISOString() })
              .eq(config.primaryKey, operation.entityId);
            return !softDeleteError;
          } else {
            const { error: deleteError } = await supabase
              .from(config.table)
              .delete()
              .eq(config.primaryKey, operation.entityId);
            return !deleteError;
          }

        default:
          return false;
      }
    } catch (error) {
      console.error('Execute sync operation error:', error);
      return false;
    }
  }

  // Conflict detection
  private async detectConflict(
    localItem: any,
    remoteItem: any,
    config: EntitySyncConfig
  ): Promise<boolean> {
    // No conflict if timestamps match
    const localTimestamp = new Date(localItem[config.timestampField]).getTime();
    const remoteTimestamp = new Date(remoteItem[config.timestampField]).getTime();
    
    if (localTimestamp === remoteTimestamp) {
      return false;
    }

    // Check if local has unsynced changes
    const hasLocalChanges = await this.hasUnsyncedChanges(
      localItem[config.primaryKey],
      config.table
    );

    return hasLocalChanges;
  }

  // Conflict resolution
  private async handleConflicts(
    conflicts: SyncConflict[],
    strategy: ConflictResolutionStrategy = 'local_wins'
  ): Promise<void> {
    for (const conflict of conflicts) {
      let resolvedData: any;

      switch (strategy) {
        case 'local_wins':
          resolvedData = conflict.localData;
          break;

        case 'remote_wins':
          resolvedData = conflict.remoteData;
          await this.updateLocalData(conflict.entity, conflict.remoteData, conflict.localData.user_id);
          break;

        case 'merge':
          resolvedData = await this.mergeConflict(conflict);
          await this.updateLocalData(conflict.entity, resolvedData, conflict.localData.user_id);
          break;

        case 'manual':
          // Store conflict for manual resolution
          this.conflicts.push(conflict);
          continue;
      }

      conflict.resolved = true;
      conflict.resolvedData = resolvedData;
      conflict.resolution = strategy;
    }
  }

  // Merge conflict resolution
  private async mergeConflict(conflict: SyncConflict): Promise<any> {
    const config = this.entityConfigs.get(conflict.entity);
    if (!config || !config.mergeableFields) {
      // Can't merge, use latest
      return conflict.localTimestamp > conflict.remoteTimestamp
        ? conflict.localData
        : conflict.remoteData;
    }

    // Start with remote data as base
    const merged = { ...conflict.remoteData };

    // Merge specific fields
    for (const field of config.mergeableFields) {
      if (conflict.entity === 'workout' && field === 'sets') {
        // Special handling for workout sets
        merged[field] = this.mergeWorkoutSets(
          conflict.localData[field],
          conflict.remoteData[field]
        );
      } else if (Array.isArray(conflict.localData[field])) {
        // Merge arrays by combining unique items
        const localArray = conflict.localData[field] || [];
        const remoteArray = conflict.remoteData[field] || [];
        merged[field] = this.mergeArrays(localArray, remoteArray);
      } else {
        // Use latest value for non-array fields
        if (conflict.localTimestamp > conflict.remoteTimestamp) {
          merged[field] = conflict.localData[field];
        }
      }
    }

    // Update timestamp to latest
    merged[config.timestampField] = new Date(
      Math.max(conflict.localTimestamp, conflict.remoteTimestamp)
    ).toISOString();

    return merged;
  }

  // Merge workout sets intelligently
  private mergeWorkoutSets(localSets: any[], remoteSets: any[]): any[] {
    if (!localSets || !remoteSets) {
      return localSets || remoteSets || [];
    }

    const merged: any[] = [];
    const setMap = new Map<string, any>();

    // Add all remote sets
    for (const set of remoteSets) {
      const key = `${set.exercise_id}_${set.set_number}`;
      setMap.set(key, set);
    }

    // Merge or add local sets
    for (const set of localSets) {
      const key = `${set.exercise_id}_${set.set_number}`;
      const remoteSet = setMap.get(key);
      
      if (remoteSet) {
        // Merge: use higher values (assuming user wants to track progress)
        merged.push({
          ...remoteSet,
          weight: Math.max(set.weight || 0, remoteSet.weight || 0),
          reps: Math.max(set.reps || 0, remoteSet.reps || 0),
          completed: set.completed || remoteSet.completed
        });
        setMap.delete(key);
      } else {
        merged.push(set);
      }
    }

    // Add remaining remote sets
    for (const set of setMap.values()) {
      merged.push(set);
    }

    return merged;
  }

  // Merge arrays by combining unique items
  private mergeArrays(local: any[], remote: any[]): any[] {
    const merged = [...remote];
    const remoteIds = new Set(remote.map(item => item.id || JSON.stringify(item)));
    
    for (const item of local) {
      const itemId = item.id || JSON.stringify(item);
      if (!remoteIds.has(itemId)) {
        merged.push(item);
      }
    }
    
    return merged;
  }

  // Process sync queue
  private async processSyncQueue(): Promise<void> {
    await syncQueue.processQueue(async (operation) => {
      const config = this.entityConfigs.get(operation.entity);
      if (!config) return false;
      
      return this.executeSyncOperation(operation, config);
    });
  }

  // Local data management helpers
  private async getLocalData(entity: EntityType, userId: string): Promise<any[]> {
    switch (entity) {
      case 'workout':
        return (await offlineStorage.getWorkouts(userId)) || [];
      case 'food_log':
        return (await offlineStorage.getNutritionLogs(userId)) || [];
      case 'recipe':
        return (await offlineStorage.getRecipes(userId)) || [];
      case 'template':
        return (await offlineStorage.getWorkoutTemplates(userId)) || [];
      default:
        return [];
    }
  }

  private async saveLocalData(entity: EntityType, data: any, userId: string): Promise<void> {
    const existing = await this.getLocalData(entity, userId);
    existing.push(data);
    
    switch (entity) {
      case 'workout':
        await offlineStorage.storeWorkouts(existing, userId);
        break;
      case 'food_log':
        await offlineStorage.storeNutritionLogs(existing, userId);
        break;
      case 'recipe':
        await offlineStorage.storeRecipes(existing, userId);
        break;
      case 'template':
        await offlineStorage.storeWorkoutTemplates(existing, userId);
        break;
    }
  }

  private async updateLocalData(entity: EntityType, data: any, userId: string): Promise<void> {
    const existing = await this.getLocalData(entity, userId);
    const config = this.entityConfigs.get(entity);
    if (!config) return;
    
    const index = existing.findIndex(item => item[config.primaryKey] === data[config.primaryKey]);
    if (index !== -1) {
      existing[index] = data;
    } else {
      existing.push(data);
    }
    
    switch (entity) {
      case 'workout':
        await offlineStorage.storeWorkouts(existing, userId);
        break;
      case 'food_log':
        await offlineStorage.storeNutritionLogs(existing, userId);
        break;
      case 'recipe':
        await offlineStorage.storeRecipes(existing, userId);
        break;
      case 'template':
        await offlineStorage.storeWorkoutTemplates(existing, userId);
        break;
    }
  }

  private async hasUnsyncedChanges(entityId: string, table: string): Promise<boolean> {
    const operations = syncQueue.getQueue();
    return operations.some(op => 
      op.entityId === entityId && 
      op.status === 'pending'
    );
  }

  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  // Utility methods
  private createResult(success: boolean, errors: string[] = []): SyncResult {
    return {
      success,
      pushed: 0,
      pulled: 0,
      conflicts: [],
      errors,
      duration: 0,
      timestamp: Date.now()
    };
  }

  // Manual conflict resolution
  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merged', mergedData?: any): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    let resolvedData: any;
    switch (resolution) {
      case 'local':
        resolvedData = conflict.localData;
        break;
      case 'remote':
        resolvedData = conflict.remoteData;
        break;
      case 'merged':
        resolvedData = mergedData || await this.mergeConflict(conflict);
        break;
    }

    // Update local data
    await this.updateLocalData(conflict.entity, resolvedData, conflict.localData.user_id);
    
    // Queue sync to server
    await syncQueue.add('UPDATE', conflict.entity, resolvedData, conflict.localData.user_id, {
      entityId: conflict.entityId,
      priority: 'high'
    });

    // Mark as resolved
    conflict.resolved = true;
    conflict.resolvedData = resolvedData;
    
    // Remove from conflicts list
    this.conflicts = this.conflicts.filter(c => c.id !== conflictId);
  }

  // Get unresolved conflicts
  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  // Event listeners
  onSync(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  private notifySyncListeners(result: SyncResult): void {
    this.syncListeners.forEach(listener => listener(result));
  }

  // Force sync specific entity
  async forceSyncEntity(entity: EntityType, userId: string): Promise<SyncResult> {
    return this.sync({
      entities: [entity],
      forceSync: true
    });
  }

  // Get sync status
  getSyncStatus(): {
    inProgress: boolean;
    lastSync: Map<string, number>;
    pendingOperations: number;
    conflicts: number;
  } {
    return {
      inProgress: this.syncInProgress,
      lastSync: new Map(this.lastSyncTimestamps),
      pendingOperations: syncQueue.getPendingOperations().length,
      conflicts: this.conflicts.length
    };
  }

  // Clear all sync data
  async clearSyncData(): Promise<void> {
    this.lastSyncTimestamps.clear();
    this.conflicts = [];
    await offlineStorage.delete('sync_timestamps');
    syncQueue.clearAll();
  }
}

// Export singleton instance
export const syncEngine = new SyncEngine();