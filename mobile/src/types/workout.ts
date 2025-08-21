// Workout System Type Definitions

export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'balance';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'bodyweight' | 'cable' | 'kettlebell' | 'bands' | 'equipment';
export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type GoalType = 'weight' | 'reps' | 'one_rep_max' | 'volume' | 'duration';

// Exercise related types
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  instructions?: string;
  imageUrl?: string;
  videoUrl?: string;
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Set related types
export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight?: number; // in kg or lbs based on user preference
  reps?: number;
  distanceMeters?: number; // For cardio exercises
  durationSeconds?: number; // For time-based exercises
  restSeconds?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
  createdAt?: Date;
}

// Workout exercise (exercise within a workout)
export interface WorkoutExercise {
  id: string;
  workoutId?: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  orderIndex: number;
  notes?: string;
  isSuperset?: boolean;
  supersetGroup?: number;
  previousSets?: WorkoutSet[]; // Previous workout data for reference
  personalRecord?: PersonalRecord;
}

// Main workout type
export interface Workout {
  id: string;
  userId: string;
  name: string;
  status?: WorkoutStatus;
  startedAt: Date;
  completedAt?: Date;
  exercises: WorkoutExercise[];
  totalVolume?: number; // Total weight * reps
  totalSets?: number;
  durationSeconds?: number;
  notes?: string;
  templateId?: string; // If created from template
  createdAt?: Date;
  updatedAt?: Date;
}

// Template types
export interface TemplateExercise {
  exerciseId: string;
  exercise?: Exercise; // Populated when fetching
  sets: number;
  reps: number | string; // Can be range like "8-12"
  weight?: number;
  restSeconds?: number;
  notes?: string;
  isSuperset?: boolean;
  supersetGroup?: number;
}

export interface WorkoutTemplate {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  isPublic?: boolean;
  category?: string; // push/pull/legs, upper/lower, full_body, custom
  tags?: string[];
  usageCount?: number;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Personal records
export interface PersonalRecord {
  id?: string;
  userId: string;
  exerciseId: string;
  exerciseName?: string;
  weight: number;
  reps: number;
  oneRepMax: number;
  volume?: number; // weight * reps
  achievedAt: Date;
  workoutId?: string;
  previousRecord?: {
    weight: number;
    reps: number;
    oneRepMax: number;
    achievedAt: Date;
  };
}

// User preferences and settings
export interface WorkoutSettings {
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'miles';
  defaultRestTime: number; // in seconds
  autoStartTimer: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  showPreviousWorkout: boolean;
  plateCalculator: number[]; // Available plates for barbell
}

// Analytics and statistics
export interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  totalDuration: number; // in seconds
  averageWorkoutDuration: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercises: Array<{
    exercise: Exercise;
    count: number;
  }>;
  muscleGroupDistribution: Record<MuscleGroup, number>;
  personalRecords: PersonalRecord[];
}

// Workout goals
export interface WorkoutGoal {
  id: string;
  userId: string;
  exerciseId?: string;
  exercise?: Exercise;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  deadline?: Date;
  achieved: boolean;
  achievedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Progress tracking
export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  data: Array<{
    date: Date;
    weight: number;
    reps: number;
    oneRepMax: number;
    volume: number;
  }>;
}

// Calendar view types
export interface WorkoutCalendarDay {
  date: Date;
  workouts: Array<{
    id: string;
    name: string;
    duration: number;
    exerciseCount: number;
    completed: boolean;
  }>;
}

// Quick workout creation
export interface QuickWorkout {
  name: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    targetReps: number;
    targetWeight?: number;
  }>;
}

// Superset group
export interface SupersetGroup {
  groupId: number;
  exercises: WorkoutExercise[];
}

// Timer state
export interface TimerState {
  isRunning: boolean;
  startTime?: number;
  pausedTime?: number;
  totalPausedDuration: number;
  currentDuration: number;
  restTimerActive: boolean;
  restTimeRemaining?: number;
  restExerciseId?: string;
}

// Form helpers
export interface SetFormData {
  weight: string;
  reps: string;
  restSeconds?: string;
  rpe?: string;
}

export interface ExerciseSearchFilters {
  query?: string;
  category?: ExerciseCategory;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  onlyFavorites?: boolean;
  onlyCustom?: boolean;
}

// API Response types
export interface WorkoutResponse {
  workout: Workout;
  personalRecords?: PersonalRecord[];
  message?: string;
}

export interface ExerciseLibraryResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  pageSize: number;
}

// Validation types
export interface WorkoutValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export/Import types
export interface WorkoutExport {
  version: string;
  exportDate: Date;
  workouts: Workout[];
  templates?: WorkoutTemplate[];
  exercises?: Exercise[];
  personalRecords?: PersonalRecord[];
}

// Chart data types
export interface ChartDataPoint {
  x: number | Date;
  y: number;
  label?: string;
}

export interface VolumeChartData {
  dates: Date[];
  volumes: number[];
  movingAverage?: number[];
}

export interface MuscleGroupChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

// One Rep Max calculation
export interface OneRepMaxFormula {
  name: string;
  calculate: (weight: number, reps: number) => number;
}

// Rest timer
export interface RestTimer {
  duration: number;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  onComplete?: () => void;
}

// Notification types
export interface WorkoutNotification {
  id: string;
  type: 'rest_complete' | 'workout_reminder' | 'goal_achieved' | 'new_pr';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

// Offline sync
export interface OfflineWorkoutQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: 'workout' | 'set' | 'exercise' | 'template';
  data: any;
  timestamp: Date;
  synced: boolean;
  error?: string;
}