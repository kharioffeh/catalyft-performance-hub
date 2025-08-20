/**
 * Zod validation schemas for data validation
 */

import { z } from 'zod';

// User validation schemas
export const UserPreferencesSchema = z.object({
  units: z.enum(['metric', 'imperial']),
  notifications: z.object({
    workoutReminders: z.boolean(),
    mealReminders: z.boolean(),
    hydrationReminders: z.boolean(),
    achievements: z.boolean(),
    socialUpdates: z.boolean(),
    pushEnabled: z.boolean(),
    emailEnabled: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']),
    shareWorkouts: z.boolean(),
    shareProgress: z.boolean(),
    shareNutrition: z.boolean(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  fullName: z.string().min(1).max(100),
  profilePicture: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().min(50).max(300).optional(), // cm
  weight: z.number().min(20).max(500).optional(), // kg
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  fitnessGoals: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  preferences: UserPreferencesSchema.optional(),
});

export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  fullName: z.string().min(1, 'Full name is required').max(100),
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UserProfileUpdateSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  profilePicture: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  fitnessGoals: z.array(z.string()).optional(),
});

// Workout validation schemas
export const ExerciseSetSchema = z.object({
  id: z.string(),
  setNumber: z.number().min(1),
  type: z.enum(['normal', 'warmup', 'drop', 'failure', 'rest_pause', 'cluster', 'amrap']),
  reps: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  restAfter: z.number().min(0).optional(),
  isCompleted: z.boolean(),
  actualReps: z.number().min(0).optional(),
  actualWeight: z.number().min(0).optional(),
  actualDistance: z.number().min(0).optional(),
  actualDuration: z.number().min(0).optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export const WorkoutExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  order: z.number().min(1),
  sets: z.array(ExerciseSetSchema),
  restTime: z.number().min(0).optional(),
  notes: z.string().optional(),
  isSuperset: z.boolean().optional(),
  supersetGroupId: z.string().optional(),
});

export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'pilates', 'crossfit', 'custom']),
  duration: z.number().min(0),
  scheduledDate: z.date().optional(),
  completedDate: z.date().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'skipped']),
  exercises: z.array(WorkoutExerciseSchema),
  totalCaloriesBurned: z.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().optional(),
  templateId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'pilates', 'crossfit', 'custom']),
  scheduledDate: z.date().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    order: z.number().min(1),
    sets: z.array(z.object({
      type: z.enum(['normal', 'warmup', 'drop', 'failure', 'rest_pause', 'cluster', 'amrap']),
      reps: z.number().min(0).optional(),
      weight: z.number().min(0).optional(),
      distance: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      restAfter: z.number().min(0).optional(),
    })),
    restTime: z.number().min(0).optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one exercise is required'),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().optional(),
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  category: z.enum(['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'olympic', 'powerlifting']),
  muscleGroups: z.array(z.enum([
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'quads', 'hamstrings', 'glutes', 'calves',
    'traps', 'lats'
  ])),
  equipment: z.array(z.enum([
    'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable',
    'bodyweight', 'resistance_band', 'medicine_ball', 'stability_ball',
    'foam_roller', 'none'
  ])),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.array(z.string()),
  tips: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  caloriesPerMinute: z.number().min(0).optional(),
  isCustom: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
});

// Nutrition validation schemas
export const MacrosSchema = z.object({
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  saturatedFat: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
});

export const FoodItemSchema = z.object({
  id: z.string(),
  foodId: z.string(),
  quantity: z.number().min(0),
  unit: z.string(),
  calories: z.number().min(0),
  macros: MacrosSchema,
  customServingSize: z.number().min(0).optional(),
});

export const MealSchema = z.object({
  id: z.string(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']),
  name: z.string().min(1).max(100),
  time: z.date(),
  foods: z.array(FoodItemSchema),
  totalCalories: z.number().min(0),
  macros: MacrosSchema,
  notes: z.string().optional(),
  photo: z.string().url().optional(),
});

export const NutritionEntrySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.date(),
  meals: z.array(MealSchema),
  waterIntake: z.number().min(0),
  totalCalories: z.number().min(0),
  macros: MacrosSchema,
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateNutritionEntrySchema = z.object({
  date: z.date(),
  meals: z.array(z.object({
    type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout']),
    name: z.string().min(1).max(100),
    time: z.date(),
    foods: z.array(z.object({
      foodId: z.string(),
      quantity: z.number().min(0),
      unit: z.string(),
    })),
    notes: z.string().optional(),
    photo: z.string().url().optional(),
  })),
  waterIntake: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const FoodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  category: z.enum(['protein', 'carbohydrate', 'fat', 'dairy', 'fruit', 'vegetable', 'grain', 'beverage', 'supplement', 'other']),
  servingSize: z.number().min(0),
  servingUnit: z.string(),
  caloriesPerServing: z.number().min(0),
  macrosPerServing: MacrosSchema,
  isCustom: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  verified: z.boolean().optional(),
});

// Goal validation schemas
export const GoalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'custom']),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetValue: z.number(),
  currentValue: z.number(),
  unit: z.string(),
  deadline: z.date().optional(),
  status: z.enum(['active', 'completed', 'paused', 'failed']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateGoalSchema = z.object({
  type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'custom']),
  title: z.string().min(1, 'Goal title is required').max(100),
  description: z.string().max(500).optional(),
  targetValue: z.number(),
  unit: z.string(),
  deadline: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Challenge validation schemas
export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  creatorId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  type: z.enum(['workout_streak', 'calories_burned', 'weight_lifted', 'distance_run', 'custom']),
  startDate: z.date(),
  endDate: z.date(),
  rules: z.array(z.string()),
  rewards: z.array(z.string()).optional(),
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled']),
  isPublic: z.boolean(),
  maxParticipants: z.number().min(2).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateChallengeSchema = z.object({
  name: z.string().min(1, 'Challenge name is required').max(100),
  description: z.string().max(1000),
  type: z.enum(['workout_streak', 'calories_burned', 'weight_lifted', 'distance_run', 'custom']),
  startDate: z.date(),
  endDate: z.date(),
  rules: z.array(z.string()).min(1, 'At least one rule is required'),
  rewards: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  maxParticipants: z.number().min(2).optional(),
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function to safely validate data (returns result object)
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): ReturnType<typeof schema.safeParse> {
  return schema.safeParse(data);
}

// Export type inference helpers
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type CreateNutritionEntry = z.infer<typeof CreateNutritionEntrySchema>;
export type CreateGoal = z.infer<typeof CreateGoalSchema>;
export type CreateChallenge = z.infer<typeof CreateChallengeSchema>;