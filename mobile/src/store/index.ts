/**
 * Main Zustand store with MMKV persistence
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';
import { UserSlice, createUserSlice } from './slices/userSlice';
import { WorkoutSlice, createWorkoutSlice } from './slices/workoutSlice';
import { NutritionSlice, createNutritionSlice } from './slices/nutritionSlice';

// Initialize MMKV for store persistence
const storage = new MMKV({
  id: 'catalyft-store',
  encryptionKey: 'catalyft-store-encryption-key', // In production, use a secure key
});

// Create MMKV storage adapter for Zustand
const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

// Combined store type
export type StoreState = UserSlice & WorkoutSlice & NutritionSlice & {
  // Global state
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
  
  // Global actions
  setIsOnline: (isOnline: boolean) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  addSyncError: (error: string) => void;
  clearSyncErrors: () => void;
  syncData: () => Promise<void>;
  clearAllData: () => void;
  resetStore: () => void;
};

// Initial state
const initialState = {
  // User slice
  currentUser: null,
  isAuthenticated: false,
  friends: [],
  goals: [],
  achievements: [],
  notifications: [],
  unreadNotificationCount: 0,
  
  // Workout slice
  workouts: [],
  exercises: [],
  currentWorkout: null,
  activeWorkout: null,
  workoutTemplates: [],
  workoutFilters: {},
  
  // Nutrition slice
  nutritionEntries: [],
  currentEntry: null,
  foods: [],
  favoriteFoods: [],
  recentFoods: [],
  dailyTargets: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    water: 2000,
  },
  
  // Global state
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  syncErrors: [],
  isLoading: false,
  error: null,
};

// Create the store
export const useStore = create<StoreState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get, api) => ({
          ...initialState,
          
          // Combine slices
          ...createUserSlice(set as any, get, api as any),
          ...createWorkoutSlice(set as any, get, api as any),
          ...createNutritionSlice(set as any, get, api as any),
          
          // Global actions
          setIsOnline: (isOnline: boolean) => set({ isOnline }),
          setIsSyncing: (isSyncing: boolean) => set({ isSyncing }),
          setLastSyncTime: (time: Date) => set({ lastSyncTime: time }),
          addSyncError: (error: string) => set((state: any) => ({
            syncErrors: [...state.syncErrors, error],
          })),
          clearSyncErrors: () => set({ syncErrors: [] }),
          
          syncData: async () => {
            const state = get();
            if (state.isSyncing || !state.isOnline || !state.currentUser) return;
            
            set({ isSyncing: true, syncErrors: [] });
            
            try {
              // Sync user data
              await state.refreshUser();
              
              // Sync workouts
              await state.loadWorkouts(state.currentUser.id);
              
              // Sync nutrition entries (last 30 days)
              const endDate = new Date();
              const startDate = new Date();
              startDate.setDate(endDate.getDate() - 30);
              await state.loadNutritionEntries(state.currentUser.id, startDate, endDate);
              
              // Sync other data
              await Promise.all([
                state.loadGoals(),
                state.loadFriends(),
                state.loadAchievements(),
                state.loadNotifications(),
                state.loadExercises(),
                state.loadFoods(),
              ]);
              
              set({ 
                lastSyncTime: new Date(),
                isSyncing: false,
              });
            } catch (error: any) {
              set((state: any) => ({
                syncErrors: [...state.syncErrors, error.message || 'Sync failed'],
                isSyncing: false,
              }));
            }
          },
          
          clearAllData: () => {
            storage.clearAll();
            set(initialState);
          },
          
          resetStore: () => {
            set(initialState);
          },
        }))
      ),
      {
        name: 'catalyft-store',
        storage: mmkvStorage as any,
        partialize: (state): any => ({
          // Persist only essential data
          currentUser: state.currentUser,
          isAuthenticated: state.isAuthenticated,
          dailyTargets: state.dailyTargets,
          workoutTemplates: state.workoutTemplates,
          favoriteFoods: state.favoriteFoods,
          lastSyncTime: state.lastSyncTime,
        }),
      }
    ),
    {
      name: 'catalyft-store',
    }
  )
);

// Selectors for common use cases
export const useUser = () => useStore(state => state.currentUser);
export const useIsAuthenticated = () => useStore(state => state.isAuthenticated);
export const useWorkouts = () => useStore(state => state.workouts);
export const useActiveWorkout = () => useStore(state => state.activeWorkout);
export const useNutritionToday = () => useStore(state => state.currentEntry);
export const useGoals = () => useStore(state => state.goals);
export const useNotifications = () => useStore(state => ({
  notifications: state.notifications,
  unreadCount: state.unreadNotificationCount,
}));

// Actions selectors
export const useAuthActions = () => useStore(state => ({
  signIn: state.signIn,
  signUp: state.signUp,
  signOut: state.signOut,
}));

export const useWorkoutActions = () => useStore(state => ({
  startWorkout: state.startWorkout,
  completeWorkout: state.completeWorkout,
  updateSet: state.updateSet,
  completeSet: state.completeSet,
}));

export const useNutritionActions = () => useStore(state => ({
  addMeal: state.addMeal,
  addFoodToMeal: state.addFoodToMeal,
  updateWaterIntake: state.updateWaterIntake,
  searchFoods: state.searchFoods,
}));

// Subscribe to auth changes
useStore.subscribe(
  state => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Start syncing when authenticated
      useStore.getState().syncData();
    } else {
      // Clear sensitive data when logged out
      useStore.setState({
        workouts: [],
        nutritionEntries: [],
        friends: [],
        notifications: [],
      });
    }
  }
);

// Subscribe to online status changes
useStore.subscribe(
  state => state.isOnline,
  (isOnline) => {
    if (isOnline) {
      // Sync when coming back online
      useStore.getState().syncData();
    }
  }
);

// Export store for debugging
if (__DEV__) {
  (global as any).store = useStore;
}