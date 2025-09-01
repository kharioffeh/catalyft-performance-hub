/**
 * Centralized store type definitions to resolve conflicts
 */

import { StateCreator } from 'zustand';
import { User, UserPreferences, UserStats, Goal, Friend, UserAchievement, Notification } from '../types/models';
import { 
  UserProfile, 
  Follow, 
  ActivityPost, 
  Comment, 
  Reaction, 
  Challenge, 
  ChallengeParticipant,
  LeaderboardEntry,
  Achievement,
  SocialNotification
} from '../types/social';
import { 
  Workout,
  WorkoutExercise,
  WorkoutSet,
  Exercise,
  WorkoutTemplate,
  PersonalRecord,
  TimerState,
  WorkoutSettings,
  ExerciseSearchFilters,
  WorkoutStats,
  WorkoutGoal,
  RestTimer
} from '../types/workout';
import {
  Food,
  FoodLogEntry,
  NutritionGoals,
  DailyNutritionSummary,
  NutritionAnalytics,
  Recipe,
  MealPlan,
  MealType,
  WaterLog,
  FoodSearchFilters,
  QuickAddPreset,
} from '../types/nutrition';

// ============================================================================
// SLICE INTERFACES (without conflicting properties)
// ============================================================================

export interface UserSlice {
  // State
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  friends: Friend[];
  goals: Goal[];
  userAchievements: UserAchievement[]; // User's personal achievements
  notifications: Notification[];
  userUnreadNotificationCount: number; // User's notification count

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
  loadUserAchievements: () => Promise<void>;
  unlockUserAchievement: (achievementId: string) => void;
  
  // Notifications actions
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

export interface SocialSlice {
  // State
  userProfiles: Map<string, UserProfile>;
  currentUserProfile: UserProfile | null;
  following: Follow[];
  followers: Follow[];
  activityFeed: ActivityPost[];
  feedLoading: boolean;
  feedHasMore: boolean;
  feedPage: number;
  userPosts: Map<string, ActivityPost[]>;
  comments: Map<string, Comment[]>;
  reactions: Map<string, Reaction[]>;
  challenges: Challenge[];
  userChallenges: Challenge[];
  challengeParticipants: Map<string, ChallengeParticipant[]>;
  leaderboard: LeaderboardEntry[];
  socialAchievements: Achievement[]; // Social achievements catalog
  socialUserAchievements: Map<string, Achievement[]>; // Renamed to avoid conflict
  socialNotifications: SocialNotification[];
  socialUnreadNotificationCount: number; // Social notification count
  suggestedUsers: UserProfile[];
  socialSearchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;

  // Profile Actions
  loadUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadProfilePicture: (uri: string) => Promise<string>;
  updateProfileStats: (stats: any) => Promise<void>;

  // Follow System Actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  loadFollowers: (userId?: string) => Promise<void>;
  loadFollowing: (userId?: string) => Promise<void>;
  loadSuggestedUsers: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;

  // Activity Feed Actions
  loadActivityFeed: (refresh?: boolean) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  loadUserPosts: (userId: string) => Promise<void>;
  createPost: (post: Partial<ActivityPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  shareWorkout: (workoutId: string, caption?: string) => Promise<void>;
  shareMeal: (mealId: string, caption?: string, imageUrl?: string) => Promise<void>;
  shareAchievement: (achievementId: string, caption?: string) => Promise<void>;

  // Engagement Actions
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addReaction: (postId: string, type: string) => Promise<void>;
  removeReaction: (postId: string) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Challenge Actions
  loadChallenges: () => Promise<void>;
  loadUserChallenges: () => Promise<void>;
  createChallenge: (challenge: Partial<Challenge>) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: any) => Promise<void>;
  loadChallengeParticipants: (challengeId: string) => Promise<void>;
  loadChallengeLeaderboard: (challengeId: string) => Promise<void>;

  // Leaderboard Actions
  loadGlobalLeaderboard: (category: string, timeframe: string) => Promise<void>;
  loadFriendsLeaderboard: (category: string, timeframe: string) => Promise<void>;

  // Achievement Actions
  loadSocialAchievements: () => Promise<void>;
  loadSocialUserAchievements: (userId: string) => Promise<void>;
  unlockSocialAchievement: (achievementId: string) => Promise<void>;

  // Notification Actions
  loadSocialNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Utility Actions
  clearSocialData: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface WorkoutSlice {
  // Current workout
  currentWorkout: Workout | null;
  workoutTimer: TimerState;
  restTimer: RestTimer | null;
  
  // Workout history
  workoutHistory: Workout[];
  workoutHistoryLoading: boolean;
  
  // Exercise library
  exercises: Exercise[];
  exercisesLoading: boolean;
  favoriteExercises: Exercise[];
  recentExercises: Exercise[];
  exerciseSearchFilters: ExerciseSearchFilters;
  
  // Templates
  templates: WorkoutTemplate[];
  templatesLoading: boolean;
  
  // Personal records
  personalRecords: PersonalRecord[];
  newPersonalRecords: PersonalRecord[];
  
  // Stats and goals
  workoutStats: WorkoutStats | null;
  workoutGoals: WorkoutGoal[];
  
  // Settings
  workoutSettings: WorkoutSettings;
  
  // Actions (simplified for now)
  startWorkout: (templateId?: string) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => void;
  deleteWorkout: (workoutId: string) => void;
  loadWorkoutHistory: () => Promise<void>;
}

export interface NutritionSlice {
  // Date navigation
  currentDate: Date;
  
  // Food logs
  todaysFoodLogs: FoodLogEntry[];
  dailySummary: DailyNutritionSummary | null;
  
  // Nutrition goals
  nutritionGoals: NutritionGoals | null;
  
  // Food search
  searchResults: Food[];
  searchLoading: boolean;
  searchFilters: FoodSearchFilters;
  selectedFood: Food | null;
  
  // Favorites and recent
  favoriteFoods: Food[];
  recentFoods: Food[];
  customFoods: Food[];
  
  // Water tracking
  todaysWaterLogs: WaterLog[];
  waterGoal: number;
  quickWaterPresets: QuickAddPreset[];
  
  // Recipes
  recipes: Recipe[];
  mealPlans: MealPlan[];
  
  // Analytics
  nutritionAnalytics: NutritionAnalytics | null;
  
  // Actions (simplified for now)
  logFood: (food: Food, quantity: number, mealType: MealType) => void;
  updateFoodLog: (logId: string, updates: Partial<FoodLogEntry>) => void;
  deleteFoodLog: (logId: string) => void;
  logWater: (amount: number) => void;
  refreshTodaysData: () => Promise<void>;
}

// ============================================================================
// COMBINED STORE TYPE
// ============================================================================

export type StoreState = UserSlice & SocialSlice & WorkoutSlice & NutritionSlice & {
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

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

export const isUserAchievement = (achievement: any): achievement is UserAchievement => {
  return achievement && typeof achievement.achievementId === 'string' && typeof achievement.userId === 'string';
};

export const isSocialAchievement = (achievement: any): achievement is Achievement => {
  return achievement && typeof achievement.id === 'string' && typeof achievement.category === 'string';
};

// ============================================================================
// SLICE CREATOR TYPES
// ============================================================================

export type UserSliceCreator = StateCreator<StoreState, [], [], UserSlice>;
export type SocialSliceCreator = StateCreator<StoreState, [], [], SocialSlice>;

// ============================================================================
// COMPATIBILITY MAPPINGS
// ============================================================================

// Legacy property mappings for backward compatibility
export interface LegacyStoreState extends StoreState {
  // Legacy aliases for backward compatibility
  achievements: UserAchievement[]; // Maps to userAchievements
  unreadNotificationCount: number; // Maps to userUnreadNotificationCount
}

// Helper functions to maintain backward compatibility
export const getLegacyAchievements = (state: StoreState): UserAchievement[] => {
  return state.userAchievements;
};

export const getLegacyUnreadCount = (state: StoreState): number => {
  return state.userUnreadNotificationCount;
};

export const getSocialAchievements = (state: StoreState): Achievement[] => {
  return state.socialAchievements;
};

export const getSocialUnreadCount = (state: StoreState): number => {
  return state.socialUnreadNotificationCount;
};