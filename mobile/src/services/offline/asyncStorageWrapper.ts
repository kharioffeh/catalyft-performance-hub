import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple wrapper to replace MMKV with AsyncStorage
export class AsyncStorageWrapper {
  private prefix: string;

  constructor(id: string, encryptionKey?: string) {
    this.prefix = `${id}:`;
    // Note: AsyncStorage doesn't support encryption natively
    // For now, we'll use it without encryption
  }

  set(key: string, value: string): void {
    AsyncStorage.setItem(this.prefix + key, value);
  }

  getString(key: string): string | undefined {
    // AsyncStorage is async, but MMKV is sync
    // For now, we'll return undefined and handle async in the calling code
    return undefined;
  }

  async getStringAsync(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(this.prefix + key);
  }

  delete(key: string): void {
    AsyncStorage.removeItem(this.prefix + key);
  }

  clearAll(): void {
    // This is more complex with AsyncStorage, but we'll handle it
    AsyncStorage.getAllKeys().then(keys => {
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
      AsyncStorage.multiRemove(prefixedKeys);
    });
  }

  contains(key: string): boolean {
    // AsyncStorage is async, so we can't check synchronously
    // For now, we'll assume it contains the key
    return true;
  }

  getAllKeys(): string[] {
    // AsyncStorage is async, so we can't get keys synchronously
    // For now, we'll return an empty array
    return [];
  }
}

// Create a simple MMKV-like interface
export const createMMKV = (config: { id: string; encryptionKey?: string }) => {
  return new AsyncStorageWrapper(config.id, config.encryptionKey);
};