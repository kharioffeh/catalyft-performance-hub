import { offlineStorage } from './storage';
import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface CachePolicy {
  maxAge: number; // Days
  maxSize: number; // MB
  priority: 'low' | 'normal' | 'high' | 'critical';
  compress: boolean;
  encrypt: boolean;
}

export interface CacheEntry {
  key: string;
  size: number;
  created: number;
  accessed: number;
  hits: number;
  entity: string;
  priority: string;
}

export interface CacheStats {
  totalSize: number;
  totalItems: number;
  byEntity: Record<string, { count: number; size: number }>;
  oldestItem: number;
  newestItem: number;
  hitRate: number;
  missRate: number;
}

export interface CachePreferences {
  enabled: boolean;
  maxCacheSize: number; // MB
  autoCleanup: boolean;
  cleanupInterval: number; // Hours
  wifiOnlyDownload: boolean;
  preserveCritical: boolean;
  compressionEnabled: boolean;
}

export class CacheManager {
  private storage: MMKV;
  private preferences: CachePreferences;
  private cacheIndex: Map<string, CacheEntry> = new Map();
  private hitCount = 0;
  private missCount = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  private readonly policies: Map<string, CachePolicy> = new Map([
    ['workouts', {
      maxAge: 30,
      maxSize: 20,
      priority: 'high',
      compress: true,
      encrypt: false
    }],
    ['nutrition', {
      maxAge: 30,
      maxSize: 15,
      priority: 'high',
      compress: true,
      encrypt: false
    }],
    ['exercises', {
      maxAge: 90,
      maxSize: 10,
      priority: 'normal',
      compress: true,
      encrypt: false
    }],
    ['foods', {
      maxAge: 60,
      maxSize: 25,
      priority: 'normal',
      compress: true,
      encrypt: false
    }],
    ['recipes', {
      maxAge: 90,
      maxSize: 15,
      priority: 'normal',
      compress: true,
      encrypt: false
    }],
    ['templates', {
      maxAge: 180,
      maxSize: 10,
      priority: 'high',
      compress: true,
      encrypt: false
    }],
    ['user_data', {
      maxAge: 365,
      maxSize: 5,
      priority: 'critical',
      compress: false,
      encrypt: true
    }],
    ['images', {
      maxAge: 14,
      maxSize: 50,
      priority: 'low',
      compress: false,
      encrypt: false
    }]
  ]);

  constructor() {
    this.storage = new MMKV({
      id: 'cache-manager'
    });
    
    this.preferences = this.loadPreferences();
    this.loadCacheIndex();
    
    if (this.preferences.autoCleanup) {
      this.startAutoCleanup();
    }
  }

  private loadPreferences(): CachePreferences {
    const stored = this.storage.getString('preferences');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      enabled: true,
      maxCacheSize: 100, // 100MB default
      autoCleanup: true,
      cleanupInterval: 24, // Daily
      wifiOnlyDownload: false,
      preserveCritical: true,
      compressionEnabled: true
    };
  }

  private savePreferences(): void {
    this.storage.set('preferences', JSON.stringify(this.preferences));
  }

  private loadCacheIndex(): void {
    const stored = this.storage.getString('cache_index');
    if (stored) {
      const index = JSON.parse(stored);
      this.cacheIndex = new Map(Object.entries(index));
    }
  }

  private saveCacheIndex(): void {
    const index = Object.fromEntries(this.cacheIndex);
    this.storage.set('cache_index', JSON.stringify(index));
  }

  // Cache operations
  async get<T>(key: string, entity: string): Promise<T | null> {
    if (!this.preferences.enabled) {
      this.missCount++;
      return null;
    }

    const entry = this.cacheIndex.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    const policy = this.policies.get(entity) || this.policies.get('default');
    if (policy && this.isExpired(entry, policy)) {
      await this.remove(key);
      this.missCount++;
      return null;
    }

    // Get from storage
    const data = await offlineStorage.get<T>(key);
    if (data) {
      // Update access info
      entry.accessed = Date.now();
      entry.hits++;
      this.cacheIndex.set(key, entry);
      this.hitCount++;
      return data;
    }

    this.missCount++;
    return null;
  }

  async set<T>(key: string, data: T, entity: string): Promise<void> {
    if (!this.preferences.enabled) return;

    const policy = this.policies.get(entity) || this.getDefaultPolicy();
    
    // Check cache size before adding
    const dataSize = this.estimateSize(data);
    await this.ensureSpace(dataSize, policy.priority);

    // Store data
    await offlineStorage.set(key, data, {
      compress: policy.compress && this.preferences.compressionEnabled,
      encrypt: policy.encrypt
    });

    // Update index
    const entry: CacheEntry = {
      key,
      size: dataSize,
      created: Date.now(),
      accessed: Date.now(),
      hits: 0,
      entity,
      priority: policy.priority
    };
    
    this.cacheIndex.set(key, entry);
    this.saveCacheIndex();
  }

  async remove(key: string): Promise<void> {
    offlineStorage.delete(key);
    this.cacheIndex.delete(key);
    this.saveCacheIndex();
  }

  async clear(entity?: string): Promise<void> {
    if (entity) {
      // Clear specific entity
      const keysToRemove: string[] = [];
      for (const [key, entry] of this.cacheIndex) {
        if (entry.entity === entity) {
          keysToRemove.push(key);
        }
      }
      
      for (const key of keysToRemove) {
        await this.remove(key);
      }
    } else {
      // Clear all except critical
      if (this.preferences.preserveCritical) {
        const keysToRemove: string[] = [];
        for (const [key, entry] of this.cacheIndex) {
          if (entry.priority !== 'critical') {
            keysToRemove.push(key);
          }
        }
        
        for (const key of keysToRemove) {
          await this.remove(key);
        }
      } else {
        offlineStorage.clear();
        this.cacheIndex.clear();
        this.saveCacheIndex();
      }
    }
  }

  // Cache management
  private async ensureSpace(requiredSize: number, priority: string): Promise<void> {
    const maxSize = this.preferences.maxCacheSize * 1024 * 1024; // Convert to bytes
    const currentSize = this.getTotalSize();
    
    if (currentSize + requiredSize <= maxSize) {
      return;
    }

    // Need to free space
    const spaceNeeded = (currentSize + requiredSize) - maxSize;
    await this.evict(spaceNeeded, priority);
  }

  private async evict(bytesToFree: number, incomingPriority: string): Promise<void> {
    let freedSpace = 0;
    
    // Sort entries by priority and access time
    const entries = Array.from(this.cacheIndex.entries()).sort((a, b) => {
      const priorityDiff = this.getPriorityValue(a[1].priority) - this.getPriorityValue(b[1].priority);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Same priority, evict least recently used
      return a[1].accessed - b[1].accessed;
    });

    for (const [key, entry] of entries) {
      if (freedSpace >= bytesToFree) break;
      
      // Don't evict higher or equal priority items for lower priority incoming
      if (this.getPriorityValue(entry.priority) >= this.getPriorityValue(incomingPriority)) {
        continue;
      }
      
      freedSpace += entry.size;
      await this.remove(key);
    }
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'normal': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // Cleanup operations
  async cleanup(): Promise<number> {
    let removedCount = 0;
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, entry] of this.cacheIndex) {
      const policy = this.policies.get(entry.entity);
      if (!policy) continue;

      // Check expiration
      if (this.isExpired(entry, policy)) {
        keysToRemove.push(key);
        removedCount++;
        continue;
      }

      // Check if unused for long time (2x maxAge)
      const unusedDays = (now - entry.accessed) / (1000 * 60 * 60 * 24);
      if (unusedDays > policy.maxAge * 2 && entry.priority !== 'critical') {
        keysToRemove.push(key);
        removedCount++;
      }
    }

    // Remove expired items
    for (const key of keysToRemove) {
      await this.remove(key);
    }

    // Clean up orphaned files
    await this.cleanupOrphanedFiles();

    return removedCount;
  }

  private async cleanupOrphanedFiles(): Promise<void> {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const cacheDir = `${FileSystem.cacheDirectory}catalyft/`;
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        
        for (const file of files) {
          const filePath = `${cacheDir}${file}`;
          const info = await FileSystem.getInfoAsync(filePath);
          
          // Remove files older than 30 days
          if (info.modificationTime && Date.now() - info.modificationTime > 30 * 24 * 60 * 60 * 1000) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
          }
        }
      } catch (error) {
        console.error('Error cleaning up files:', error);
      }
    }
  }

  private startAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    const intervalMs = this.preferences.cleanupInterval * 60 * 60 * 1000;
    this.cleanupTimer = setInterval(async () => {
      console.log('[CacheManager] Running auto cleanup...');
      const removed = await this.cleanup();
      console.log(`[CacheManager] Removed ${removed} expired items`);
    }, intervalMs);

    // Run initial cleanup
    this.cleanup();
  }

  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // Utility methods
  private isExpired(entry: CacheEntry, policy: CachePolicy): boolean {
    const ageInDays = (Date.now() - entry.created) / (1000 * 60 * 60 * 24);
    return ageInDays > policy.maxAge;
  }

  private estimateSize(data: any): number {
    const str = JSON.stringify(data);
    return str.length * 2; // Rough estimate (2 bytes per character)
  }

  private getTotalSize(): number {
    let total = 0;
    for (const entry of this.cacheIndex.values()) {
      total += entry.size;
    }
    return total;
  }

  private getDefaultPolicy(): CachePolicy {
    return {
      maxAge: 7,
      maxSize: 5,
      priority: 'normal',
      compress: true,
      encrypt: false
    };
  }

  // Statistics and monitoring
  getStats(): CacheStats {
    const byEntity: Record<string, { count: number; size: number }> = {};
    let oldestItem = Date.now();
    let newestItem = 0;

    for (const entry of this.cacheIndex.values()) {
      if (!byEntity[entry.entity]) {
        byEntity[entry.entity] = { count: 0, size: 0 };
      }
      byEntity[entry.entity].count++;
      byEntity[entry.entity].size += entry.size;

      if (entry.created < oldestItem) oldestItem = entry.created;
      if (entry.created > newestItem) newestItem = entry.created;
    }

    const totalHits = this.hitCount + this.missCount;
    const hitRate = totalHits > 0 ? this.hitCount / totalHits : 0;
    const missRate = totalHits > 0 ? this.missCount / totalHits : 0;

    return {
      totalSize: this.getTotalSize(),
      totalItems: this.cacheIndex.size,
      byEntity,
      oldestItem,
      newestItem,
      hitRate,
      missRate
    };
  }

  getMostAccessed(limit = 10): CacheEntry[] {
    return Array.from(this.cacheIndex.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  getLeastAccessed(limit = 10): CacheEntry[] {
    return Array.from(this.cacheIndex.values())
      .sort((a, b) => a.hits - b.hits)
      .slice(0, limit);
  }

  getOldestItems(limit = 10): CacheEntry[] {
    return Array.from(this.cacheIndex.values())
      .sort((a, b) => a.created - b.created)
      .slice(0, limit);
  }

  // Preferences management
  updatePreferences(preferences: Partial<CachePreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();

    // Handle auto-cleanup changes
    if (preferences.autoCleanup !== undefined) {
      if (preferences.autoCleanup) {
        this.startAutoCleanup();
      } else {
        this.stopAutoCleanup();
      }
    }

    // Handle interval changes
    if (preferences.cleanupInterval !== undefined && this.preferences.autoCleanup) {
      this.startAutoCleanup(); // Restart with new interval
    }
  }

  getPreferences(): CachePreferences {
    return { ...this.preferences };
  }

  // Cache warming
  async warmCache(entity: string, data: any[]): Promise<void> {
    if (!this.preferences.enabled) return;

    const policy = this.policies.get(entity);
    if (!policy) return;

    for (const item of data) {
      if (item.id) {
        const key = `${entity}_${item.id}`;
        await this.set(key, item, entity);
      }
    }
  }

  // Export/Import for backup
  async exportCache(): Promise<string> {
    const data = {
      index: Object.fromEntries(this.cacheIndex),
      preferences: this.preferences,
      stats: {
        hitCount: this.hitCount,
        missCount: this.missCount
      }
    };
    
    return JSON.stringify(data);
  }

  async importCache(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.index) {
        this.cacheIndex = new Map(Object.entries(parsed.index));
        this.saveCacheIndex();
      }
      
      if (parsed.preferences) {
        this.updatePreferences(parsed.preferences);
      }
      
      if (parsed.stats) {
        this.hitCount = parsed.stats.hitCount || 0;
        this.missCount = parsed.stats.missCount || 0;
      }
    } catch (error) {
      console.error('Error importing cache:', error);
      throw error;
    }
  }

  // Reset cache statistics
  resetStats(): void {
    this.hitCount = 0;
    this.missCount = 0;
    
    for (const entry of this.cacheIndex.values()) {
      entry.hits = 0;
    }
    
    this.saveCacheIndex();
  }

  // Destroy and cleanup
  destroy(): void {
    this.stopAutoCleanup();
    this.saveCacheIndex();
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();