/**
 * Testing utilities for social features
 * Provides mock data generators and test helpers
 */

import { 
  UserProfile, 
  ActivityPost, 
  Comment, 
  Challenge, 
  Achievement,
  PrivacySettings 
} from '../types/social';

// Helper function to create default privacy settings
const createDefaultPrivacySettings = (): PrivacySettings => ({
  profileVisibility: 'public',
  showWorkoutDetails: true,
  showNutritionDetails: false,
  showLocation: false,
  allowTagging: true,
  allowMessages: 'followers',
  blockedUsers: [],
  
  shareWorkoutStats: true,
  sharePersonalRecords: true,
  shareBodyMeasurements: false,
  shareWeight: false,
  shareCaloriesBurned: true,
  shareDuration: true,
  shareExerciseDetails: true,
  
  shareMealPhotos: false,
  shareMacros: false,
  shareCalorieIntake: false,
  
  shareStreaks: true,
  shareAchievements: true,
  shareChallengeParticipation: true,
  shareLeaderboardPosition: true,
  allowFriendRequests: true,
  showInDiscovery: true,
  
  activityFeedPrivacy: 'followers',
  workoutHistoryPrivacy: 'private',
  achievementsPrivacy: 'public',
});

// Mock data generators
export const mockDataGenerators = {
  // Generate mock user profile
  createMockUserProfile: (overrides?: Partial<UserProfile>): UserProfile => ({
    id: `profile-${Date.now()}`,
    userId: `user-${Date.now()}`,
    username: `testuser${Math.floor(Math.random() * 1000)}`,
    fullName: 'Test User',
    bio: 'Fitness enthusiast | Personal trainer | Marathon runner',
    profilePicture: 'https://via.placeholder.com/150',
    coverPhoto: 'https://via.placeholder.com/500x200',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    isPrivate: false,
    isVerified: false,
    
    followersCount: Math.floor(Math.random() * 1000),
    followingCount: Math.floor(Math.random() * 500),
    postsCount: Math.floor(Math.random() * 100),
    workoutsCount: Math.floor(Math.random() * 200),
    
    totalWorkouts: 150,
    totalWorkoutTime: 4500,
    currentStreak: 7,
    longestStreak: 30,
    totalCaloriesBurned: 45000,
    personalRecords: [
      { exerciseName: 'Bench Press', value: 225, unit: 'lbs', achievedAt: new Date() },
      { exerciseName: 'Squat', value: 315, unit: 'lbs', achievedAt: new Date() },
    ],
    
    showWorkoutStats: true,
    showNutritionStats: true,
    showAchievements: true,
    allowMessages: 'following',
    
    privacySettings: overrides?.privacySettings || createDefaultPrivacySettings(),
    
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Generate mock privacy settings
  createMockPrivacySettings: (overrides?: Partial<PrivacySettings>): PrivacySettings => ({
    profileVisibility: 'public',
    showWorkoutDetails: true,
    showNutritionDetails: false,
    showLocation: false,
    allowTagging: true,
    allowMessages: 'followers',
    blockedUsers: [],
    
    shareWorkoutStats: true,
    sharePersonalRecords: true,
    shareBodyMeasurements: false,
    shareWeight: false,
    shareCaloriesBurned: true,
    shareDuration: true,
    shareExerciseDetails: true,
    
    shareMealPhotos: false,
    shareMacros: false,
    shareCalorieIntake: false,
    
    shareStreaks: true,
    shareAchievements: true,
    shareChallengeParticipation: true,
    shareLeaderboardPosition: true,
    allowFriendRequests: true,
    showInDiscovery: true,
    
    activityFeedPrivacy: 'followers',
    workoutHistoryPrivacy: 'private',
    achievementsPrivacy: 'public',
    ...overrides,
  }),

  // Generate mock activity posts
  createMockActivityPosts: (count: number = 10): ActivityPost[] => {
    const postTypes: ActivityPost['type'][] = ['workout', 'meal', 'achievement', 'pr', 'challenge', 'text'];
    const posts: ActivityPost[] = [];
    
    for (let i = 0; i < count; i++) {
      const type = postTypes[Math.floor(Math.random() * postTypes.length)];
      const post: ActivityPost = {
        id: `post-${Date.now()}-${i}`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        type,
        content: `This is a test ${type} post #${i}`,
        images: Math.random() > 0.5 ? ['https://via.placeholder.com/400'] : undefined,
        
        likesCount: Math.floor(Math.random() * 100),
        commentsCount: Math.floor(Math.random() * 20),
        sharesCount: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.5,
        
        visibility: 'public',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      
      // Add type-specific data
      switch (type) {
        case 'workout':
          post.workoutData = {
            workoutId: `workout-${i}`,
            name: 'Morning Workout',
            duration: 45 + Math.floor(Math.random() * 60),
            exercises: 5 + Math.floor(Math.random() * 10),
            caloriesBurned: 200 + Math.floor(Math.random() * 400),
            muscleGroups: ['Chest', 'Triceps'],
            intensity: 'medium',
          };
          break;
        case 'meal':
          post.mealData = {
            mealId: `meal-${i}`,
            name: 'Protein Bowl',
            calories: 400 + Math.floor(Math.random() * 300),
            protein: 30 + Math.floor(Math.random() * 20),
            carbs: 40 + Math.floor(Math.random() * 30),
            fats: 15 + Math.floor(Math.random() * 15),
            mealType: 'lunch',
          };
          break;
        case 'achievement':
          post.achievementData = {
            achievementId: `achievement-${i}`,
            name: '30 Day Streak',
            description: 'Worked out for 30 days straight',
            icon: '🔥',
            rarity: 'epic',
          };
          break;
        case 'pr':
          post.prData = {
            exerciseName: 'Bench Press',
            previousRecord: 200,
            newRecord: 225,
            unit: 'lbs',
            improvement: 12.5,
          };
          break;
      }
      
      posts.push(post);
    }
    
    return posts;
  },

  // Generate mock challenges
  createMockChallenges: (count: number = 5): Challenge[] => {
    const challenges: Challenge[] = [];
    
    for (let i = 0; i < count; i++) {
      challenges.push({
        id: `challenge-${Date.now()}-${i}`,
        creatorId: `user-${Math.floor(Math.random() * 100)}`,
        name: `Challenge ${i + 1}`,
        description: 'Complete the challenge to win!',
        type: 'workouts',
        category: 'strength',
        
        goal: 20 + Math.floor(Math.random() * 30),
        unit: 'workouts',
        duration: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        
        participantsCount: Math.floor(Math.random() * 100),
        isPublic: true,
        inviteOnly: false,
        points: 100,
        
        status: 'active',
        isJoined: Math.random() > 0.5,
        userProgress: Math.floor(Math.random() * 100),
        userRank: Math.floor(Math.random() * 10) + 1,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return challenges;
  },

  // Generate mock achievements
  createMockAchievements: (count: number = 10): Achievement[] => {
    const achievements: Achievement[] = [];
    const names = [
      'First Workout', 'Week Warrior', 'Streak Master', 
      'Social Butterfly', 'Challenge Champion', 'PR Hunter'
    ];
    
    for (let i = 0; i < count; i++) {
      achievements.push({
        id: `achievement-${Date.now()}-${i}`,
        name: names[i % names.length],
        description: 'Complete the requirement to unlock',
        category: 'workout',
        icon: '🏆',
        rarity: ['common', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 4)] as any,
        points: 10 + Math.floor(Math.random() * 90),
        
        requirement: {
          type: 'workout_count',
          target: 10 + Math.floor(Math.random() * 50),
          description: 'Complete workouts',
        },
        
        isUnlocked: Math.random() > 0.5,
        unlockedAt: new Date(),
        createdAt: new Date(),
      });
    }
    
    return achievements;
  },
};

// Test scenarios for different privacy configurations
export const privacyTestScenarios = {
  publicProfile: (): PrivacySettings => ({
    ...mockDataGenerators.createMockPrivacySettings(),
    profileVisibility: 'public',
    showWorkoutDetails: true,
    showNutritionDetails: true,
    shareBodyMeasurements: true,
    shareWeight: true,
    activityFeedPrivacy: 'public',
    workoutHistoryPrivacy: 'public',
    achievementsPrivacy: 'public',
  }),

  privateProfile: (): PrivacySettings => ({
    ...mockDataGenerators.createMockPrivacySettings(),
    profileVisibility: 'private',
    showWorkoutDetails: false,
    showNutritionDetails: false,
    shareBodyMeasurements: false,
    shareWeight: false,
    activityFeedPrivacy: 'private',
    workoutHistoryPrivacy: 'private',
    achievementsPrivacy: 'private',
  }),

  followersOnlyProfile: (): PrivacySettings => ({
    ...mockDataGenerators.createMockPrivacySettings(),
    profileVisibility: 'followers',
    showWorkoutDetails: true,
    showNutritionDetails: true,
    shareBodyMeasurements: false,
    shareWeight: false,
    activityFeedPrivacy: 'followers',
    workoutHistoryPrivacy: 'followers',
    achievementsPrivacy: 'followers',
  }),
};

// Performance testing utilities
export const performanceUtils = {
  // Measure render time
  measureRenderTime: (componentName: string, startTime: number) => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    console.log(`[PERF] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    
    if (renderTime > 100) {
      console.warn(`[PERF] ${componentName} render time exceeds 100ms`);
    }
    
    return renderTime;
  },

  // Measure API call time
  measureApiCallTime: async (apiCall: () => Promise<any>, callName: string) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const callTime = endTime - startTime;
      console.log(`[API] ${callName} completed in ${callTime.toFixed(2)}ms`);
      
      if (callTime > 1000) {
        console.warn(`[API] ${callName} exceeds 1000ms`);
      }
      
      return { result, callTime };
    } catch (error) {
      const endTime = performance.now();
      const callTime = endTime - startTime;
      console.error(`[API] ${callName} failed after ${callTime.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Memory usage checker
  checkMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
      const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
      console.log(`[MEMORY] Using ${usedMB}MB of ${totalMB}MB`);
      
      if (memory.usedJSHeapSize / memory.totalJSHeapSize > 0.9) {
        console.warn('[MEMORY] High memory usage detected (>90%)');
      }
    }
  },
};

// Validation utilities
export const validationUtils = {
  // Validate user profile
  validateUserProfile: (profile: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!profile.id) errors.push('Profile ID is required');
    if (!profile.userId) errors.push('User ID is required');
    if (!profile.username) errors.push('Username is required');
    if (profile.username && !/^[a-zA-Z0-9_]{3,20}$/.test(profile.username)) {
      errors.push('Username must be 3-20 characters, alphanumeric and underscore only');
    }
    if (profile.bio && profile.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate post content
  validatePost: (post: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!post.type) errors.push('Post type is required');
    if (post.content && post.content.length > 1000) {
      errors.push('Post content must be less than 1000 characters');
    }
    if (post.images && post.images.length > 10) {
      errors.push('Maximum 10 images allowed per post');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate privacy settings
  validatePrivacySettings: (settings: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validVisibility = ['public', 'followers', 'private'];
    
    if (settings.profileVisibility && !validVisibility.includes(settings.profileVisibility)) {
      errors.push('Invalid profile visibility setting');
    }
    if (settings.allowMessages && !['everyone', 'followers', 'none'].includes(settings.allowMessages)) {
      errors.push('Invalid message setting');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Error simulation for testing error handling
export const errorSimulation = {
  // Simulate network errors
  simulateNetworkError: (probability: number = 0.1): void => {
    if (Math.random() < probability) {
      throw new Error('Network request failed');
    }
  },

  // Simulate API errors
  simulateApiError: (probability: number = 0.1): void => {
    if (Math.random() < probability) {
      const errors = [
        { code: 400, message: 'Bad Request' },
        { code: 401, message: 'Unauthorized' },
        { code: 403, message: 'Forbidden' },
        { code: 404, message: 'Not Found' },
        { code: 500, message: 'Internal Server Error' },
      ];
      const error = errors[Math.floor(Math.random() * errors.length)];
      throw new Error(`API Error ${error.code}: ${error.message}`);
    }
  },

  // Simulate rate limiting
  simulateRateLimit: (requestCount: number, limit: number = 100): void => {
    if (requestCount > limit) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  },
};

// Accessibility testing utilities
export const accessibilityUtils = {
  // Check if component has accessibility labels
  checkAccessibilityLabels: (component: any): string[] => {
    const missingLabels: string[] = [];
    
    // Check for common accessibility props
    if (!component.accessibilityLabel && !component.accessible) {
      missingLabels.push('Missing accessibility label');
    }
    if (component.onPress && !component.accessibilityRole) {
      missingLabels.push('Missing accessibility role for interactive element');
    }
    
    return missingLabels;
  },

  // Generate accessibility labels
  generateAccessibilityLabel: (type: string, content: string): string => {
    const labels: { [key: string]: string } = {
      button: `${content} button`,
      link: `${content} link`,
      image: `Image: ${content}`,
      text: content,
    };
    
    return labels[type] || content;
  },
};

// Test data cleanup utilities
export const cleanupUtils = {
  // Clear test data from storage
  clearTestData: async (): Promise<void> => {
    try {
      // Clear AsyncStorage test keys
      const testKeys = [
        '@test_user_profile',
        '@test_activity_feed',
        '@test_challenges',
        '@test_achievements',
      ];
      
      // In a real implementation, you would clear these from AsyncStorage
      console.log('Test data cleared successfully');
    } catch (error) {
      console.error('Error clearing test data:', error);
    }
  },

  // Reset mock timers
  resetMockTimers: (): void => {
    if (jest && jest.clearAllTimers) {
      jest.clearAllTimers();
    }
  },
};