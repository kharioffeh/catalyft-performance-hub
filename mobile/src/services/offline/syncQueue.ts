
import { v4 as uuidv4 } from 'uuid';

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type EntityType = 'workout' | 'food_log' | 'recipe' | 'water_log' | 'exercise' | 'template' | 'goal';
export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'completed';
export type Priority = 'low' | 'normal' | 'high' | 'critical';

export interface SyncOperation {
  id: string;
  type: OperationType;
  entity: EntityType;
  entityId?: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: SyncStatus;
  priority: Priority;
  error?: string;
  lastAttempt?: number;
  userId: string;
  conflictResolution?: 'local' | 'remote' | 'merge';
}

export interface QueueStats {
  pending: number;
  syncing: number;
  failed: number;
  completed: number;
  total: number;
}

export class SyncQueue {
  private storage: MMKV;
  private readonly QUEUE_KEY = 'sync_queue';
  private readonly FAILED_KEY = 'sync_failed';
  private readonly COMPLETED_KEY = 'sync_completed';
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // Base delay in ms
  private syncInProgress = false;
  private listeners: Set<(queue: SyncOperation[]) => void> = new Set();

  constructor() {
    this.storage = new MMKV({
      id: 'catalyft-sync-queue'
    });

    // Initialize queue if not exists
    if (!this.storage.contains(this.QUEUE_KEY)) {
      this.storage.set(this.QUEUE_KEY, JSON.stringify([]));
    }
    if (!this.storage.contains(this.FAILED_KEY)) {
      this.storage.set(this.FAILED_KEY, JSON.stringify([]));
    }
    if (!this.storage.contains(this.COMPLETED_KEY)) {
      this.storage.set(this.COMPLETED_KEY, JSON.stringify([]));
    }
  }

  // Queue Management
  async add(
    type: OperationType,
    entity: EntityType,
    data: any,
    userId: string,
    options?: {
      entityId?: string;
      priority?: Priority;
      conflictResolution?: 'local' | 'remote' | 'merge';
    }
  ): Promise<SyncOperation> {
    const operation: SyncOperation = {
      id: uuidv4(),
      type,
      entity,
      entityId: options?.entityId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
      status: 'pending',
      priority: options?.priority || 'normal',
      userId,
      conflictResolution: options?.conflictResolution
    };

    // Check for duplicate operations
    const isDuplicate = await this.checkDuplicate(operation);
    if (isDuplicate) {
      console.log('Duplicate operation detected, merging...');
      return this.mergeOperations(isDuplicate, operation);
    }

    // Add to queue
    const queue = this.getQueue();
    
    // Check queue size limit
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      await this.cleanupOldOperations();
    }

    queue.push(operation);
    this.saveQueue(queue);
    this.notifyListeners(queue);

    return operation;
  }

  async addBatch(operations: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'maxRetries' | 'status'>[]): Promise<SyncOperation[]> {
    const queue = this.getQueue();
    const newOperations: SyncOperation[] = [];

    for (const op of operations) {
      const operation: SyncOperation = {
        ...op,
        id: uuidv4(),
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: this.MAX_RETRIES,
        status: 'pending'
      };
      newOperations.push(operation);
    }

    queue.push(...newOperations);
    this.saveQueue(queue);
    this.notifyListeners(queue);

    return newOperations;
  }

  getQueue(): SyncOperation[] {
    const queueStr = this.storage.getString(this.QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  }

  getPendingOperations(): SyncOperation[] {
    return this.getQueue().filter(op => op.status === 'pending');
  }

  getFailedOperations(): SyncOperation[] {
    const failedStr = this.storage.getString(this.FAILED_KEY);
    return failedStr ? JSON.parse(failedStr) : [];
  }

  getCompletedOperations(): SyncOperation[] {
    const completedStr = this.storage.getString(this.COMPLETED_KEY);
    return completedStr ? JSON.parse(completedStr) : [];
  }

  // Process queue
  async processQueue(syncFunction: (operation: SyncOperation) => Promise<boolean>): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return;
    }

    this.syncInProgress = true;
    const queue = this.getQueue();
    const pendingOps = queue
      .filter(op => op.status === 'pending' || op.status === 'failed')
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));

    for (const operation of pendingOps) {
      try {
        // Update status to syncing
        operation.status = 'syncing';
        operation.lastAttempt = Date.now();
        this.updateOperation(operation);

        // Execute sync
        const success = await syncFunction(operation);

        if (success) {
          operation.status = 'completed';
          this.moveToCompleted(operation);
        } else {
          await this.handleFailure(operation);
        }
      } catch (error) {
        console.error('Error processing operation:', error);
        operation.error = error instanceof Error ? error.message : 'Unknown error';
        await this.handleFailure(operation);
      }
    }

    this.syncInProgress = false;
  }

  private async handleFailure(operation: SyncOperation): Promise<void> {
    operation.retryCount++;
    
    if (operation.retryCount >= operation.maxRetries) {
      operation.status = 'failed';
      this.moveToFailed(operation);
    } else {
      operation.status = 'pending';
      // Calculate exponential backoff
      const delay = this.RETRY_DELAY_BASE * Math.pow(2, operation.retryCount);
      setTimeout(() => {
        this.updateOperation(operation);
      }, delay);
    }
  }

  // Operation management
  updateOperation(operation: SyncOperation): void {
    const queue = this.getQueue();
    const index = queue.findIndex(op => op.id === operation.id);
    
    if (index !== -1) {
      queue[index] = operation;
      this.saveQueue(queue);
      this.notifyListeners(queue);
    }
  }

  removeOperation(operationId: string): void {
    const queue = this.getQueue();
    const filtered = queue.filter(op => op.id !== operationId);
    this.saveQueue(filtered);
    this.notifyListeners(filtered);
  }

  private moveToCompleted(operation: SyncOperation): void {
    this.removeOperation(operation.id);
    
    const completed = this.getCompletedOperations();
    completed.push(operation);
    
    // Keep only last 100 completed operations
    if (completed.length > 100) {
      completed.shift();
    }
    
    this.storage.set(this.COMPLETED_KEY, JSON.stringify(completed));
  }

  private moveToFailed(operation: SyncOperation): void {
    this.removeOperation(operation.id);
    
    const failed = this.getFailedOperations();
    failed.push(operation);
    
    // Keep only last 50 failed operations
    if (failed.length > 50) {
      failed.shift();
    }
    
    this.storage.set(this.FAILED_KEY, JSON.stringify(failed));
  }

  // Retry failed operations
  async retryFailed(): Promise<void> {
    const failed = this.getFailedOperations();
    const queue = this.getQueue();

    for (const operation of failed) {
      operation.status = 'pending';
      operation.retryCount = 0;
      operation.error = undefined;
      queue.push(operation);
    }

    this.saveQueue(queue);
    this.storage.set(this.FAILED_KEY, JSON.stringify([]));
    this.notifyListeners(queue);
  }

  async retryOperation(operationId: string): Promise<void> {
    const failed = this.getFailedOperations();
    const operation = failed.find(op => op.id === operationId);
    
    if (operation) {
      operation.status = 'pending';
      operation.retryCount = 0;
      operation.error = undefined;
      
      const queue = this.getQueue();
      queue.push(operation);
      this.saveQueue(queue);
      
      // Remove from failed
      const updatedFailed = failed.filter(op => op.id !== operationId);
      this.storage.set(this.FAILED_KEY, JSON.stringify(updatedFailed));
      
      this.notifyListeners(queue);
    }
  }

  // Clear operations
  clearCompleted(): void {
    this.storage.set(this.COMPLETED_KEY, JSON.stringify([]));
  }

  clearFailed(): void {
    this.storage.set(this.FAILED_KEY, JSON.stringify([]));
  }

  clearAll(): void {
    this.storage.set(this.QUEUE_KEY, JSON.stringify([]));
    this.storage.set(this.FAILED_KEY, JSON.stringify([]));
    this.storage.set(this.COMPLETED_KEY, JSON.stringify([]));
    this.notifyListeners([]);
  }

  // Duplicate detection and merging
  private async checkDuplicate(operation: SyncOperation): Promise<SyncOperation | null> {
    const queue = this.getQueue();
    
    // Check for same entity and type within last 5 seconds
    const duplicate = queue.find(op => 
      op.entity === operation.entity &&
      op.entityId === operation.entityId &&
      op.type === operation.type &&
      op.status === 'pending' &&
      Math.abs(op.timestamp - operation.timestamp) < 5000
    );

    return duplicate || null;
  }

  private mergeOperations(existing: SyncOperation, newOp: SyncOperation): SyncOperation {
    // Merge data based on operation type
    if (existing.type === 'UPDATE' && newOp.type === 'UPDATE') {
      existing.data = { ...existing.data, ...newOp.data };
      existing.timestamp = newOp.timestamp;
    } else if (existing.type === 'CREATE' && newOp.type === 'UPDATE') {
      existing.data = { ...existing.data, ...newOp.data };
    }
    
    // Use higher priority
    if (this.getPriorityWeight(newOp.priority) > this.getPriorityWeight(existing.priority)) {
      existing.priority = newOp.priority;
    }

    this.updateOperation(existing);
    return existing;
  }

  // Cleanup
  private async cleanupOldOperations(): Promise<void> {
    const queue = this.getQueue();
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // Remove completed operations older than 1 day
    const filtered = queue.filter(op => {
      if (op.status === 'completed') {
        return now - op.timestamp < ONE_DAY;
      }
      return true;
    });

    this.saveQueue(filtered);
  }

  // Utility methods
  private getPriorityWeight(priority: Priority): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  private saveQueue(queue: SyncOperation[]): void {
    this.storage.set(this.QUEUE_KEY, JSON.stringify(queue));
  }

  private notifyListeners(queue: SyncOperation[]): void {
    this.listeners.forEach(listener => listener(queue));
  }

  // Event listeners
  subscribe(listener: (queue: SyncOperation[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Statistics
  getStats(): QueueStats {
    const queue = this.getQueue();
    const failed = this.getFailedOperations();
    const completed = this.getCompletedOperations();

    return {
      pending: queue.filter(op => op.status === 'pending').length,
      syncing: queue.filter(op => op.status === 'syncing').length,
      failed: failed.length,
      completed: completed.length,
      total: queue.length + failed.length + completed.length
    };
  }

  // Get operations by entity
  getOperationsByEntity(entity: EntityType, userId: string): SyncOperation[] {
    const queue = this.getQueue();
    return queue.filter(op => op.entity === entity && op.userId === userId);
  }

  // Batch operations by entity for efficient syncing
  getBatchedOperations(): Map<EntityType, SyncOperation[]> {
    const queue = this.getPendingOperations();
    const batches = new Map<EntityType, SyncOperation[]>();

    for (const op of queue) {
      if (!batches.has(op.entity)) {
        batches.set(op.entity, []);
      }
      batches.get(op.entity)!.push(op);
    }

    return batches;
  }
}

// Export singleton instance
export const syncQueue = new SyncQueue();