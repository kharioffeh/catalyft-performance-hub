/**
 * Social feature types for Catalyft fitness app
 */

// User Profile Types
export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  location?: string;
  website?: string;
  isPrivate: boolean;
  isVerified: boolean;
  isCurrentUser?: boolean;
  
  // Stats
  followersCount: number;
  followingCount: number;
  postsCount: number;
  workoutsCount: number;
  
  // Fitness Stats
  totalWorkouts: number;
  totalWorkoutTime: number; // minutes
  currentStreak: number;
  longestStreak: number;
  totalCaloriesBurned: number;
  personalRecords: PersonalRecordSummary[];
  
  // Preferences
  showWorkoutStats: boolean;
  showNutritionStats: boolean;
  showAchievements: boolean;
  allowMessages: 'everyone' | 'following' | 'none';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalRecordSummary {
  exerciseName: string;
  value: number;
  unit: string;
  achievedAt: Date;
}

// Follow System Types
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowRequest {
  id: string;
  requesterId: string;
  targetId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Activity Feed Types
export interface ActivityPost {
  id: string;
  userId: string;
  user?: UserProfile;
  type: 'workout' | 'meal' | 'achievement' | 'challenge' | 'pr' | 'text' | 'photo';
  content?: string;
  images?: string[];
  
  // Type-specific data
  workoutData?: WorkoutSummary;
  mealData?: MealSummary;
  achievementData?: AchievementData;
  challengeData?: ChallengeSummary;
  prData?: PersonalRecordData;
  
  // Engagement
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  userReaction?: string;
  
  // Metadata
  tags?: string[];
  mentions?: string[];
  location?: string;
  visibility: 'public' | 'followers' | 'private';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSummary {
  workoutId: string;
  name: string;
  duration: number; // minutes
  exercises: number;
  caloriesBurned: number;
  muscleGroups: string[];
  intensity: 'low' | 'medium' | 'high';
}

export interface MealSummary {
  mealId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface AchievementData {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ChallengeSummary {
  challengeId: string;
  name: string;
  type: string;
  participantsCount: number;
  progress: number;
  rank?: number;
}

export interface PersonalRecordData {
  exerciseName: string;
  previousRecord: number;
  newRecord: number;
  unit: string;
  improvement: number; // percentage
}

// Comment Types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: UserProfile;
  text: string;
  parentId?: string; // For nested comments
  replies?: Comment[];
  likesCount: number;
  isLiked?: boolean;
  mentions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Reaction Types
export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  user?: UserProfile;
  type: 'like' | 'fire' | 'strong' | 'beast' | 'inspire' | 'wow';
  createdAt: Date;
}

export const REACTION_EMOJIS = {
  like: '👍',
  fire: '🔥',
  strong: '💪',
  beast: '🦾',
  inspire: '⭐',
  wow: '😮'
};

// Challenge Types
export interface Challenge {
  id: string;
  creatorId: string;
  creator?: UserProfile;
  name: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  
  // Rules
  goal: number;
  unit: string;
  duration: number; // days
  startDate: Date;
  endDate: Date;
  
  // Participation
  participantsCount: number;
  maxParticipants?: number;
  isPublic: boolean;
  inviteOnly: boolean;
  entryFee?: number;
  
  // Rewards
  rewards?: ChallengeReward[];
  badgeIcon?: string;
  points: number;
  
  // Status
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  winner?: string;
  
  // User specific
  isJoined?: boolean;
  userProgress?: number;
  userRank?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export type ChallengeType = 
  | 'distance' // Run/walk X miles
  | 'workouts' // Complete X workouts
  | 'streak' // X day streak
  | 'calories' // Burn X calories
  | 'time' // Exercise X minutes
  | 'reps' // Complete X reps
  | 'weight' // Lift X total weight
  | 'custom';

export type ChallengeCategory = 
  | 'cardio'
  | 'strength'
  | 'flexibility'
  | 'nutrition'
  | 'mindfulness'
  | 'mixed';

export interface ChallengeReward {
  position: number; // 1st, 2nd, 3rd, etc.
  type: 'badge' | 'points' | 'title' | 'custom';
  value: string;
  description?: string;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  user?: UserProfile;
  progress: number;
  rank: number;
  lastUpdate: Date;
  completedAt?: Date;
  joinedAt: Date;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  user?: UserProfile;
  value: number;
  unit: string;
  change?: number; // Position change from last period
  trend?: 'up' | 'down' | 'same';
}

export interface LeaderboardFilter {
  category: 'workouts' | 'calories' | 'streak' | 'volume' | 'consistency' | 'prs';
  timeframe: 'week' | 'month' | 'year' | 'all';
  scope: 'global' | 'friends' | 'challenge';
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  
  // Requirements
  requirement: AchievementRequirement;
  progress?: number;
  
  // User specific
  isUnlocked?: boolean;
  unlockedAt?: Date;
  
  createdAt: Date;
}

export type AchievementCategory = 
  | 'workout'
  | 'nutrition'
  | 'social'
  | 'streak'
  | 'milestone'
  | 'challenge'
  | 'special';

export interface AchievementRequirement {
  type: string;
  target: number;
  description: string;
}

// Notification Types
export interface SocialNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  
  // Related entities
  fromUserId?: string;
  fromUser?: UserProfile;
  postId?: string;
  challengeId?: string;
  achievementId?: string;
  
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'follow'
  | 'follow_request'
  | 'like'
  | 'comment'
  | 'mention'
  | 'challenge_invite'
  | 'challenge_update'
  | 'achievement_unlock'
  | 'workout_pr'
  | 'friend_achievement';

// Share Types
export interface ShareOptions {
  postId?: string;
  content?: string;
  images?: string[];
  visibility: 'public' | 'followers' | 'private';
  tags?: string[];
  mentions?: string[];
}

// Search Types
export interface UserSearchResult {
  user: UserProfile;
  relevance: number;
  mutualFollowers?: number;
  isFollowing?: boolean;
}

// Stats Types
export interface SocialStats {
  totalFollowers: number;
  totalFollowing: number;
  totalPosts: number;
  totalLikesReceived: number;
  totalCommentsReceived: number;
  engagementRate: number;
  mostLikedPost?: ActivityPost;
  topFollowers?: UserProfile[];
  recentActivity?: ActivityPost[];
}

// Privacy Types
export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showWorkoutDetails: boolean;
  showNutritionDetails: boolean;
  showLocation: boolean;
  allowTagging: boolean;
  allowMessages: 'everyone' | 'followers' | 'none';
  blockedUsers: string[];
}