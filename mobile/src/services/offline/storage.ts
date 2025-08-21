import { MMKV } from 'react-native-mmkv';
import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

export interface StorageConfig {
  maxCacheSize: number; // in MB
  encryptionKey?: string;
  compressionEnabled: boolean;
  expirationDays: number;
}

export interface CachedItem<T = any> {
  data: T;
  timestamp: number;
  compressed?: boolean;
  encrypted?: boolean;
  size?: number;
}

export interface StorageStats {
  totalSize: number;
  itemCount: number;
  oldestItem: number;
  newestItem: number;
}

export class OfflineStorage {
  private storage: MMKV;
  private config: StorageConfig;
  private readonly ENCRYPTION_KEY: string;
  private readonly MAX_CACHE_SIZE_BYTES: number;
  private readonly LRU_CACHE_KEY = 'lru_access_times';

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      maxCacheSize: 100, // 100MB default
      compressionEnabled: true,
      expirationDays: 30,
      ...config
    };

    this.ENCRYPTION_KEY = this.config.encryptionKey || 'catalyft-default-key-2024';
    this.MAX_CACHE_SIZE_BYTES = this.config.maxCacheSize * 1024 * 1024;

    this.storage = new MMKV({
      id: 'catalyft-offline',
      encryptionKey: this.ENCRYPTION_KEY
    });

    // Initialize LRU tracking
    if (!this.storage.contains(this.LRU_CACHE_KEY)) {
      this.storage.set(this.LRU_CACHE_KEY, JSON.stringify({}));
    }
  }

  // Core storage methods
  async set<T>(key: string, data: T, options?: { compress?: boolean; encrypt?: boolean }): Promise<void> {
    try {
      const shouldCompress = options?.compress ?? this.config.compressionEnabled;
      const shouldEncrypt = options?.encrypt ?? false;

      let processedData = JSON.stringify(data);
      
      // Compress if needed
      if (shouldCompress && processedData.length > 1024) { // Only compress if > 1KB
        processedData = LZString.compressToUTF16(processedData);
      }

      // Encrypt sensitive data if needed
      if (shouldEncrypt) {
        processedData = CryptoJS.AES.encrypt(processedData, this.ENCRYPTION_KEY).toString();
      }

      const cachedItem: CachedItem<string> = {
        data: processedData,
        timestamp: Date.now(),
        compressed: shouldCompress,
        encrypted: shouldEncrypt,
        size: processedData.length
      };

      // Check cache size before storing
      await this.ensureCacheSize(processedData.length);

      this.storage.set(key, JSON.stringify(cachedItem));
      this.updateLRU(key);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const itemStr = this.storage.getString(key);
      if (!itemStr) return null;

      const cachedItem: CachedItem<string> = JSON.parse(itemStr);

      // Check expiration
      if (this.isExpired(cachedItem.timestamp)) {
        this.delete(key);
        return null;
      }

      let data = cachedItem.data;

      // Decrypt if needed
      if (cachedItem.encrypted) {
        const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
        data = bytes.toString(CryptoJS.enc.Utf8);
      }

      // Decompress if needed
      if (cachedItem.compressed) {
        data = LZString.decompressFromUTF16(data) || data;
      }

      this.updateLRU(key);
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  delete(key: string): void {
    this.storage.delete(key);
    this.removeLRU(key);
  }

  clear(): void {
    this.storage.clearAll();
    this.storage.set(this.LRU_CACHE_KEY, JSON.stringify({}));
  }

  // Specific data storage methods
  async storeWorkouts(workouts: any[], userId: string): Promise<void> {
    const key = `workouts_${userId}`;
    await this.set(key, workouts, { compress: true });
  }

  async getWorkouts(userId: string): Promise<any[] | null> {
    const key = `workouts_${userId}`;
    return this.get<any[]>(key);
  }

  async storeNutritionLogs(logs: any[], userId: string): Promise<void> {
    const key = `nutrition_${userId}`;
    await this.set(key, logs, { compress: true });
  }

  async getNutritionLogs(userId: string): Promise<any[] | null> {
    const key = `nutrition_${userId}`;
    return this.get<any[]>(key);
  }

  async storeExerciseLibrary(exercises: any[]): Promise<void> {
    await this.set('exercise_library', exercises, { compress: true });
  }

  async getExerciseLibrary(): Promise<any[] | null> {
    return this.get<any[]>('exercise_library');
  }

  async storeFrequentFoods(foods: any[], userId: string): Promise<void> {
    const key = `frequent_foods_${userId}`;
    // Limit to top 100 foods
    const topFoods = foods.slice(0, 100);
    await this.set(key, topFoods, { compress: true });
  }

  async getFrequentFoods(userId: string): Promise<any[] | null> {
    const key = `frequent_foods_${userId}`;
    return this.get<any[]>(key);
  }

  async storeRecipes(recipes: any[], userId: string): Promise<void> {
    const key = `recipes_${userId}`;
    await this.set(key, recipes, { compress: true });
  }

  async getRecipes(userId: string): Promise<any[] | null> {
    const key = `recipes_${userId}`;
    return this.get<any[]>(key);
  }

  async storeWorkoutTemplates(templates: any[], userId: string): Promise<void> {
    const key = `templates_${userId}`;
    await this.set(key, templates, { compress: true });
  }

  async getWorkoutTemplates(userId: string): Promise<any[] | null> {
    const key = `templates_${userId}`;
    return this.get<any[]>(key);
  }

  async storePersonalRecords(records: any[], userId: string): Promise<void> {
    const key = `personal_records_${userId}`;
    await this.set(key, records, { compress: false, encrypt: true });
  }

  async getPersonalRecords(userId: string): Promise<any[] | null> {
    const key = `personal_records_${userId}`;
    return this.get<any[]>(key);
  }

  async storeUserPreferences(preferences: any, userId: string): Promise<void> {
    const key = `preferences_${userId}`;
    await this.set(key, preferences, { compress: false, encrypt: true });
  }

  async getUserPreferences(userId: string): Promise<any | null> {
    const key = `preferences_${userId}`;
    return this.get<any>(key);
  }

  async storeUserGoals(goals: any, userId: string): Promise<void> {
    const key = `goals_${userId}`;
    await this.set(key, goals, { compress: false, encrypt: true });
  }

  async getUserGoals(userId: string): Promise<any | null> {
    const key = `goals_${userId}`;
    return this.get<any>(key);
  }

  // LRU Cache Management
  private updateLRU(key: string): void {
    const lruData = JSON.parse(this.storage.getString(this.LRU_CACHE_KEY) || '{}');
    lruData[key] = Date.now();
    this.storage.set(this.LRU_CACHE_KEY, JSON.stringify(lruData));
  }

  private removeLRU(key: string): void {
    const lruData = JSON.parse(this.storage.getString(this.LRU_CACHE_KEY) || '{}');
    delete lruData[key];
    this.storage.set(this.LRU_CACHE_KEY, JSON.stringify(lruData));
  }

  private async ensureCacheSize(newItemSize: number): Promise<void> {
    const currentSize = this.getCacheSize();
    
    if (currentSize + newItemSize > this.MAX_CACHE_SIZE_BYTES) {
      // Remove least recently used items
      await this.evictLRU((currentSize + newItemSize) - this.MAX_CACHE_SIZE_BYTES);
    }
  }

  private async evictLRU(bytesToFree: number): Promise<void> {
    const lruData = JSON.parse(this.storage.getString(this.LRU_CACHE_KEY) || '{}');
    
    // Sort by access time (oldest first)
    const sortedKeys = Object.entries(lruData)
      .sort(([, a], [, b]) => (a as number) - (b as number))
      .map(([key]) => key);

    let freedBytes = 0;
    for (const key of sortedKeys) {
      if (freedBytes >= bytesToFree) break;
      
      // Don't evict critical data
      if (this.isCriticalKey(key)) continue;

      const itemStr = this.storage.getString(key);
      if (itemStr) {
        const item: CachedItem = JSON.parse(itemStr);
        freedBytes += item.size || itemStr.length;
        this.delete(key);
      }
    }
  }

  private isCriticalKey(key: string): boolean {
    const criticalPrefixes = ['preferences_', 'goals_', 'personal_records_'];
    return criticalPrefixes.some(prefix => key.startsWith(prefix));
  }

  private isExpired(timestamp: number): boolean {
    const expirationMs = this.config.expirationDays * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > expirationMs;
  }

  // Utility methods
  getCacheSize(): number {
    const keys = this.storage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = this.storage.getString(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return totalSize;
  }

  getStats(): StorageStats {
    const keys = this.storage.getAllKeys();
    let oldestItem = Date.now();
    let newestItem = 0;

    for (const key of keys) {
      if (key === this.LRU_CACHE_KEY) continue;
      
      const itemStr = this.storage.getString(key);
      if (itemStr) {
        try {
          const item: CachedItem = JSON.parse(itemStr);
          if (item.timestamp < oldestItem) oldestItem = item.timestamp;
          if (item.timestamp > newestItem) newestItem = item.timestamp;
        } catch {}
      }
    }

    return {
      totalSize: this.getCacheSize(),
      itemCount: keys.length - 1, // Exclude LRU key
      oldestItem,
      newestItem
    };
  }

  // Clean up expired items
  async cleanupExpired(): Promise<number> {
    const keys = this.storage.getAllKeys();
    let removedCount = 0;

    for (const key of keys) {
      if (key === this.LRU_CACHE_KEY) continue;
      
      const itemStr = this.storage.getString(key);
      if (itemStr) {
        try {
          const item: CachedItem = JSON.parse(itemStr);
          if (this.isExpired(item.timestamp)) {
            this.delete(key);
            removedCount++;
          }
        } catch {}
      }
    }

    return removedCount;
  }

  // Export/Import for backup
  async exportData(): Promise<string> {
    const keys = this.storage.getAllKeys();
    const data: Record<string, any> = {};

    for (const key of keys) {
      if (key === this.LRU_CACHE_KEY) continue;
      const value = this.storage.getString(key);
      if (value) {
        data[key] = value;
      }
    }

    return LZString.compressToBase64(JSON.stringify(data));
  }

  async importData(compressedData: string): Promise<void> {
    try {
      const decompressed = LZString.decompressFromBase64(compressedData);
      if (!decompressed) throw new Error('Invalid backup data');

      const data = JSON.parse(decompressed);
      
      for (const [key, value] of Object.entries(data)) {
        this.storage.set(key, value as string);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();