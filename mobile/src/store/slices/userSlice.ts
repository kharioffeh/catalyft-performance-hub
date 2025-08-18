/**
 * User state slice for Zustand store
 */

import { StateCreator } from 'zustand';
import { User, UserPreferences, UserStats, Goal, Friend, UserAchievement, Notification } from '../../types/models';
import { supabaseService } from '../../services/supabase';
import { safeValidateData, UserProfileUpdateSchema } from '../../utils/validators';

export interface UserSlice {
  // State
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  friends: Friend[];
  goals: Goal[];
  achievements: UserAchievement[];
  notifications: Notification[];
  unreadNotificationCount: number;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Profile actions
  updateProfile: (updates: any) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  uploadProfilePicture: (uri: string) => Promise<void>;
  
  // Stats actions
  updateStats: (stats: Partial<UserStats>) => Promise<void>;
  incrementWorkoutCount: () => void;
  updateStreak: (currentStreak: number) => void;
  
  // Goals actions
  loadGoals: () => Promise<void>;
  createGoal: (goal: any) => Promise<void>;
  updateGoal: (goalId: string, updates: any) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  // Friends actions
  loadFriends: () => Promise<void>;
  sendFriendRequest: (friendId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  
  // Achievements actions
  loadAchievements: () => Promise<void>;
  unlockAchievement: (achievementId: string) => void;
  
  // Notifications actions
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  friends: [],
  goals: [],
  achievements: [],
  notifications: [],
  unreadNotificationCount: 0,

  // Basic setters
  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Auth actions
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, session } = await supabaseService.signIn(email, password);
      if (user) {
        const userData = await supabaseService.getUser(user.id);
        set({ 
          currentUser: userData, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        // Load related data
        await Promise.all([
          get().loadGoals(),
          get().loadFriends(),
          get().loadAchievements(),
          get().loadNotifications(),
        ]);
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign in',
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  signUp: async (email, password, userData) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await supabaseService.signUp(email, password, userData);
      if (user) {
        const newUser = await supabaseService.getUser(user.id);
        set({ 
          currentUser: newUser,
          isAuthenticated: true,
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign up',
        isLoading: false 
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabaseService.signOut();
      set({
        currentUser: null,
        isAuthenticated: false,
        friends: [],
        goals: [],
        achievements: [],
        notifications: [],
        unreadNotificationCount: 0,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to sign out',
        isLoading: false 
      });
      throw error;
    }
  },

  refreshUser: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const userData = await supabaseService.getUser(currentUser.id);
      set({ currentUser: userData });
    } catch (error: any) {
      set({ error: error.message || 'Failed to refresh user data' });
    }
  },

  // Profile actions
  updateProfile: async (updates) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    set({ isLoading: true, error: null });
    try {
      // Validate updates
      const validation = safeValidateData(UserProfileUpdateSchema, updates);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const updatedUser = await supabaseService.updateUser(currentUser.id, updates);
      set({ 
        currentUser: updatedUser,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update profile',
        isLoading: false 
      });
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    const updatedPreferences = {
      ...currentUser.preferences,
      ...preferences,
    };

    await get().updateProfile({ preferences: updatedPreferences });
  },

  uploadProfilePicture: async (uri) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    set({ isLoading: true, error: null });
    try {
      // Upload to Supabase Storage
      const fileName = `${currentUser.id}-${Date.now()}.jpg`;
      const { data, error } = await supabaseService.client.storage
        .from('profile-pictures')
        .upload(fileName, uri, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabaseService.client.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update user profile
      await get().updateProfile({ profile_picture: publicUrl });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to upload profile picture',
        isLoading: false 
      });
      throw error;
    }
  },

  // Stats actions
  updateStats: async (stats) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    try {
      await supabaseService.client
        .from('user_stats')
        .update(stats)
        .eq('user_id', currentUser.id);

      // Refresh user data to get updated stats
      await get().refreshUser();
    } catch (error: any) {
      set({ error: error.message || 'Failed to update stats' });
      throw error;
    }
  },

  incrementWorkoutCount: () => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.stats) return;

    const updatedStats = {
      ...currentUser.stats,
      totalWorkouts: currentUser.stats.totalWorkouts + 1,
    };

    set({
      currentUser: {
        ...currentUser,
        stats: updatedStats,
      },
    });

    // Update in background
    get().updateStats({ total_workouts: updatedStats.totalWorkouts }).catch(console.error);
  },

  updateStreak: (currentStreak) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.stats) return;

    const updatedStats = {
      ...currentUser.stats,
      currentStreak,
      longestStreak: Math.max(currentStreak, currentUser.stats.longestStreak),
    };

    set({
      currentUser: {
        ...currentUser,
        stats: updatedStats,
      },
    });

    // Update in background
    get().updateStats({
      current_streak: currentStreak,
      longest_streak: updatedStats.longestStreak,
    }).catch(console.error);
  },

  // Goals actions
  loadGoals: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const goals = await supabaseService.getGoals(currentUser.id, 'active');
      set({ goals });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load goals' });
    }
  },

  createGoal: async (goal) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    try {
      const newGoal = await supabaseService.createGoal({
        ...goal,
        user_id: currentUser.id,
      });
      
      set(state => ({
        goals: [...state.goals, newGoal],
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create goal' });
      throw error;
    }
  },

  updateGoal: async (goalId, updates) => {
    try {
      const updatedGoal = await supabaseService.updateGoal(goalId, updates);
      
      set(state => ({
        goals: state.goals.map(g => g.id === goalId ? updatedGoal : g),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update goal' });
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    try {
      await supabaseService.client
        .from('goals')
        .delete()
        .eq('id', goalId);
      
      set(state => ({
        goals: state.goals.filter(g => g.id !== goalId),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete goal' });
      throw error;
    }
  },

  // Friends actions
  loadFriends: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const friends = await supabaseService.getFriends(currentUser.id);
      set({ friends });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load friends' });
    }
  },

  sendFriendRequest: async (friendId) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('No user logged in');

    try {
      await supabaseService.sendFriendRequest(currentUser.id, friendId);
      // Optionally refresh friends list
      await get().loadFriends();
    } catch (error: any) {
      set({ error: error.message || 'Failed to send friend request' });
      throw error;
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await supabaseService.acceptFriendRequest(requestId);
      await get().loadFriends();
    } catch (error: any) {
      set({ error: error.message || 'Failed to accept friend request' });
      throw error;
    }
  },

  removeFriend: async (friendId) => {
    try {
      await supabaseService.client
        .from('friends')
        .delete()
        .eq('friend_id', friendId);
      
      set(state => ({
        friends: state.friends.filter(f => f.friendId !== friendId),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove friend' });
      throw error;
    }
  },

  // Achievements actions
  loadAchievements: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const achievements = await supabaseService.getUserAchievements(currentUser.id);
      set({ achievements });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load achievements' });
    }
  },

  unlockAchievement: (achievementId) => {
    set(state => ({
      achievements: state.achievements.map(a => 
        a.achievementId === achievementId 
          ? { ...a, isUnlocked: true, unlockedAt: new Date() }
          : a
      ),
    }));
  },

  // Notifications actions
  loadNotifications: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const notifications = await supabaseService.getNotifications(currentUser.id);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      set({ 
        notifications,
        unreadNotificationCount: unreadCount,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load notifications' });
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      await supabaseService.markNotificationAsRead(notificationId);
      
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark notification as read' });
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      await supabaseService.markAllNotificationsAsRead(currentUser.id);
      
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadNotificationCount: 0,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark all notifications as read' });
      throw error;
    }
  },

  clearNotifications: () => {
    set({ 
      notifications: [],
      unreadNotificationCount: 0,
    });
  },
});