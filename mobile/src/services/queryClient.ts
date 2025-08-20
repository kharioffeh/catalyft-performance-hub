/**
 * React Query setup with caching and optimistic updates
 */

import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';
import NetInfo from '@react-native-community/netinfo';
import { useStore } from '../store';
import { ApiError } from './api';

// Initialize MMKV for query cache persistence
const cacheStorage = new MMKV({
  id: 'query-cache',
  encryptionKey: 'catalyft-query-cache-key', // In production, use a secure key
});

// Custom persister for React Query
export const mmkvPersister = {
  persistClient: async (client: any) => {
    const cache = {
      timestamp: Date.now(),
      buster: 'v1',
      clientState: client,
    };
    cacheStorage.set('query-cache', JSON.stringify(cache));
  },
  restoreClient: async () => {
    const cacheString = cacheStorage.getString('query-cache');
    if (!cacheString) return undefined;

    try {
      const cache = JSON.parse(cacheString);
      
      // Check if cache is expired (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - cache.timestamp > maxAge) {
        cacheStorage.delete('query-cache');
        return undefined;
      }

      return cache.clientState;
    } catch {
      cacheStorage.delete('query-cache');
      return undefined;
    }
  },
  removeClient: async () => {
    cacheStorage.delete('query-cache');
  },
};

// Create query client with optimistic updates and retry logic
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      
      // Retry logic
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 429 (rate limit)
        if (error instanceof ApiError) {
          if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
            return false;
          }
        }
        
        // Retry up to 3 times with exponential backoff
        if (failureCount < 3) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on reconnect and window focus
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      
      // Network mode
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry failed mutations
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode
      networkMode: 'offlineFirst',
    },
  },
  
  // Query cache configuration
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Global error handling for queries
      console.error(`Query error for ${query.queryKey}:`, error);
      
      // Update store with error
      if (error instanceof ApiError && error.statusCode === 401) {
        // Handle unauthorized - sign out user
        useStore.getState().signOut();
      }
    },
    onSuccess: (data, query) => {
      // Update last sync time for successful queries
      if (query.queryKey[0] === 'sync') {
        useStore.getState().setLastSyncTime(new Date());
      }
    },
  }),
  
  // Mutation cache configuration
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Global error handling for mutations
      console.error(`Mutation error:`, error);
      
      // Show error notification
      useStore.getState().setError(
        error instanceof Error ? error.message : 'An error occurred'
      );
    },
    onSuccess: (data, variables, context, mutation) => {
      // Clear error on successful mutation
      useStore.getState().setError(null);
    },
  }),
});

// Network state management
NetInfo.addEventListener(state => {
  useStore.getState().setIsOnline(state.isConnected || false);
  
  if (state.isConnected) {
    // Resume paused mutations when online
    queryClient.resumePausedMutations();
    
    // Refetch failed queries
    queryClient.invalidateQueries();
  }
});

// Query key factory for consistent key generation
export const queryKeys = {
  // User queries
  user: (id: string) => ['user', id] as const,
  userStats: (id: string) => ['user', id, 'stats'] as const,
  userGoals: (id: string) => ['user', id, 'goals'] as const,
  userFriends: (id: string) => ['user', id, 'friends'] as const,
  userAchievements: (id: string) => ['user', id, 'achievements'] as const,
  userNotifications: (id: string) => ['user', id, 'notifications'] as const,
  
  // Workout queries
  workouts: (userId: string, filters?: any) => ['workouts', userId, filters] as const,
  workout: (id: string) => ['workout', id] as const,
  workoutTemplates: (userId: string) => ['workouts', userId, 'templates'] as const,
  exercises: (filters?: any) => ['exercises', filters] as const,
  exercise: (id: string) => ['exercise', id] as const,
  exerciseHistory: (exerciseId: string, userId: string) => 
    ['exercise', exerciseId, 'history', userId] as const,
  
  // Nutrition queries
  nutritionEntries: (userId: string, startDate: Date, endDate: Date) => 
    ['nutrition', userId, startDate.toISOString(), endDate.toISOString()] as const,
  nutritionEntry: (id: string) => ['nutrition', 'entry', id] as const,
  nutritionToday: (userId: string) => ['nutrition', userId, 'today'] as const,
  foods: (filters?: any) => ['foods', filters] as const,
  food: (id: string) => ['food', id] as const,
  foodBarcode: (barcode: string) => ['food', 'barcode', barcode] as const,
  favoriteFoods: (userId: string) => ['foods', userId, 'favorites'] as const,
  recentFoods: (userId: string) => ['foods', userId, 'recent'] as const,
  
  // Challenge queries
  challenges: (filters?: any) => ['challenges', filters] as const,
  challenge: (id: string) => ['challenge', id] as const,
  userChallenges: (userId: string) => ['challenges', 'user', userId] as const,
  
  // Analytics queries
  workoutStats: (userId: string, period: string) => 
    ['analytics', 'workouts', userId, period] as const,
  nutritionStats: (userId: string, period: string) => 
    ['analytics', 'nutrition', userId, period] as const,
  progressStats: (userId: string) => ['analytics', 'progress', userId] as const,
};

// Optimistic update helpers
export const optimisticUpdates = {
  // Add item to list
  addToList: <T>(
    queryKey: readonly unknown[],
    newItem: T,
    position: 'start' | 'end' = 'start'
  ) => {
    queryClient.setQueryData(queryKey, (old: T[] | undefined) => {
      if (!old) return [newItem];
      return position === 'start' ? [newItem, ...old] : [...old, newItem];
    });
  },
  
  // Update item in list
  updateInList: <T extends { id: string }>(
    queryKey: readonly unknown[],
    id: string,
    updates: Partial<T>
  ) => {
    queryClient.setQueryData(queryKey, (old: T[] | undefined) => {
      if (!old) return old;
      return old.map(item => item.id === id ? { ...item, ...updates } : item);
    });
  },
  
  // Remove item from list
  removeFromList: <T extends { id: string }>(
    queryKey: readonly unknown[],
    id: string
  ) => {
    queryClient.setQueryData(queryKey, (old: T[] | undefined) => {
      if (!old) return old;
      return old.filter(item => item.id !== id);
    });
  },
  
  // Update single item
  updateItem: <T>(
    queryKey: readonly unknown[],
    updates: Partial<T>
  ) => {
    queryClient.setQueryData(queryKey, (old: T | undefined) => {
      if (!old) return old;
      return { ...old, ...updates };
    });
  },
};

// Prefetch helpers
export const prefetchHelpers = {
  // Prefetch user data on app start
  prefetchUserData: async (userId: string) => {
    const promises = [
      queryClient.prefetchQuery({
        queryKey: queryKeys.user(userId),
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.userStats(userId),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.userGoals(userId),
        staleTime: 5 * 60 * 1000,
      }),
    ];
    
    await Promise.all(promises);
  },
  
  // Prefetch workout data
  prefetchWorkoutData: async (userId: string) => {
    const promises = [
      queryClient.prefetchQuery({
        queryKey: queryKeys.workouts(userId),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.exercises(),
        staleTime: 30 * 60 * 1000, // 30 minutes for exercises
      }),
    ];
    
    await Promise.all(promises);
  },
  
  // Prefetch nutrition data for today
  prefetchTodayNutrition: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.nutritionToday(userId),
      staleTime: 5 * 60 * 1000,
    });
  },
};

// Invalidation helpers
export const invalidateHelpers = {
  // Invalidate all user data
  invalidateUserData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  },
  
  // Invalidate all workout data
  invalidateWorkoutData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['workouts', userId] });
  },
  
  // Invalidate all nutrition data
  invalidateNutritionData: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['nutrition', userId] });
  },
  
  // Invalidate everything for a user
  invalidateAllUserData: (userId: string) => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes(userId);
      },
    });
  },
};

// Export for debugging
if (__DEV__) {
  (global as any).queryClient = queryClient;
}