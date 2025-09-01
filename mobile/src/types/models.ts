/**
 * Core data models for Catalyft fitness app
 */

// User related models
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoals?: string[];
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  theme: 'light' | 'dark' | 'system';
  language: string;
  [key: string]: any; // Make it compatible with Json type
}

export interface NotificationSettings {
  workoutReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  achievements: boolean;
  socialUpdates: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareWorkouts: boolean;
  shareProgress: boolean;
  shareNutrition: boolean;
}

export interface UserStats {
  totalWorkouts: number;
  totalWorkoutTime: number; // in minutes
  caloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
  personalRecords: PersonalRecord[];
  bodyMeasurements: BodyMeasurement[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  value: number;
  unit: string;
  achievedAt: Date;
}

export interface BodyMeasurement {
  id: string;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    calves?: number;
  };
}

// Workout related models
export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: WorkoutType;
  duration: number; // in minutes
  scheduledDate?: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  exercises: WorkoutExercise[];
  totalCaloriesBurned?: number;
  notes?: string;
  tags?: string[];
  isTemplate?: boolean;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkoutType = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'hiit'
  | 'yoga'
  | 'pilates'
  | 'crossfit'
  | 'custom';

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: ExerciseSet[];
  restTime?: number; // in seconds
  notes?: string;
  isSuperset?: boolean;
  supersetGroupId?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrls?: string[];
  caloriesPerMinute?: number;
  isCustom?: boolean;
  createdBy?: string;
}

export type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'balance'
  | 'plyometric'
  | 'olympic'
  | 'powerlifting';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'traps'
  | 'lats';

export type Equipment = 
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'resistance_band'
  | 'medicine_ball'
  | 'stability_ball'
  | 'foam_roller'
  | 'none';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  type: SetType;
  reps?: number;
  weight?: number; // in kg
  distance?: number; // in meters
  duration?: number; // in seconds
  restAfter?: number; // in seconds
  isCompleted: boolean;
  actualReps?: number;
  actualWeight?: number;
  actualDistance?: number;
  actualDuration?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
}

export type SetType = 
  | 'normal'
  | 'warmup'
  | 'drop'
  | 'failure'
  | 'rest_pause'
  | 'cluster'
  | 'amrap'; // As Many Reps As Possible

// Nutrition related models
export interface NutritionEntry {
  id: string;
  userId: string;
  date: Date;
  meals: Meal[];
  waterIntake: number; // in ml
  totalCalories: number;
  macros: Macros;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  time: Date;
  foods: FoodItem[];
  totalCalories: number;
  macros: Macros;
  notes?: string;
  photo?: string;
}

export type MealType = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'pre_workout'
  | 'post_workout';

export interface FoodItem {
  id: string;
  foodId: string;
  food: Food;
  quantity: number;
  unit: string;
  calories: number;
  macros: Macros;
  customServingSize?: number;
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string;
  caloriesPerServing: number;
  macrosPerServing: Macros;
  micronutrients?: Micronutrients;
  isCustom?: boolean;
  createdBy?: string;
  verified?: boolean;
}

export type FoodCategory = 
  | 'protein'
  | 'carbohydrate'
  | 'fat'
  | 'dairy'
  | 'fruit'
  | 'vegetable'
  | 'grain'
  | 'beverage'
  | 'supplement'
  | 'other';

export interface Macros {
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  saturatedFat?: number; // in grams
  sodium?: number; // in mg
}

export interface Micronutrients {
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  folate?: number;
  vitaminB12?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  zinc?: number;
}

// Goal and Progress models
export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused' | 'failed';
  priority: 'low' | 'medium' | 'high';
  milestones?: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export type GoalType = 
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'custom';

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  achievedValue?: number;
  achievedDate?: Date;
  isCompleted: boolean;
}

// Social features models
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friend: User;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
}

export interface Challenge {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  type: ChallengeType;
  startDate: Date;
  endDate: Date;
  participants: ChallengeParticipant[];
  rules: string[];
  rewards?: string[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  isPublic: boolean;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ChallengeType = 
  | 'workout_streak'
  | 'calories_burned'
  | 'weight_lifted'
  | 'distance_run'
  | 'custom';

export interface ChallengeParticipant {
  id: string;
  userId: string;
  user: User;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  rank?: number;
  isCompleted: boolean;
}

// Achievement models
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  requiredValue: number;
  unit: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AchievementCategory = 
  | 'workout'
  | 'nutrition'
  | 'streak'
  | 'social'
  | 'milestone'
  | 'special';

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
  progress: number;
  isUnlocked: boolean;
}

// Notification models
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'workout_reminder'
  | 'meal_reminder'
  | 'achievement_unlocked'
  | 'friend_request'
  | 'challenge_invite'
  | 'system';

// Sync and offline models
export interface SyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
  createdAt: Date;
  lastAttempt?: Date;
}

export interface CacheEntry {
  key: string;
  data: any;
  expiresAt: Date;
  version: number;
}