// AI Types and Interfaces for ARIA

export interface AriaMessage {
  id: string;
  type: 'text' | 'workout' | 'meal' | 'chart' | 'video' | 'form-analysis' | 'voice';
  content: any;
  sender: 'user' | 'aria';
  timestamp: Date;
  actions?: MessageAction[];
  metadata?: MessageMetadata;
}

export interface MessageAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  payload?: any;
}

export interface MessageMetadata {
  confidence?: number;
  sources?: string[];
  isStreaming?: boolean;
  audioUrl?: string;
  duration?: number;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  currentWorkout?: ActiveWorkout;
  recentWorkouts?: Workout[];
  nutritionToday?: DailyNutrition;
  goals?: UserGoals;
  injuries?: string[];
  preferences?: UserPreferences;
  location?: UserLocation;
  timeOfDay?: string;
  mood?: string;
  energyLevel?: number;
}

export interface ActiveWorkout {
  id: string;
  name: string;
  startTime: Date;
  duration: number;
  completedSets: number;
  totalSets: number;
  currentExercise?: Exercise;
  lastSet?: SetData;
  currentHeartRate?: number;
  caloriesBurned?: number;
  restTimer?: number;
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  duration: number;
  exercises: Exercise[];
  totalVolume: number;
  caloriesBurned: number;
  notes?: string;
  rating?: number;
  muscleGroups: string[];
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: SetData[];
  restTime: number;
  notes?: string;
  formVideoUrl?: string;
  targetRPE?: number;
}

export interface SetData {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  rir?: number;
  tempo?: string;
  restTaken?: number;
  formRating?: number;
}

export interface DailyNutrition {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number;
  meals: Meal[];
  supplements?: Supplement[];
}

export interface Meal {
  id: string;
  name: string;
  time: Date;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foods: Food[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
}

export interface UserGoals {
  primary: PrimaryGoal;
  secondary?: string[];
  targetWeight?: number;
  targetBodyFat?: number;
  targetDate?: Date;
  weeklyWorkouts: number;
  dailyCalories?: number;
  dailyProtein?: number;
  specificGoals?: SpecificGoal[];
}

export interface PrimaryGoal {
  type: 'weight-loss' | 'muscle-gain' | 'strength' | 'endurance' | 'recomp' | 'maintenance';
  target?: number;
  timeline?: string;
}

export interface SpecificGoal {
  exercise: string;
  metric: 'weight' | 'reps' | 'time' | 'distance';
  current: number;
  target: number;
  deadline?: Date;
}

export interface UserPreferences {
  workoutTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  workoutDuration: number; // minutes
  equipment: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  trainingStyle: string[];
  dietaryRestrictions: string[];
  supplementStack: string[];
  communicationStyle: 'motivational' | 'technical' | 'balanced' | 'tough-love';
}

export interface UserLocation {
  gym?: string;
  city?: string;
  timezone: string;
  weather?: WeatherCondition;
}

export interface WeatherCondition {
  temperature: number;
  condition: string;
  humidity: number;
}

export interface WorkoutRequirements {
  duration: number;
  equipment: string[];
  muscleGroups?: string[];
  intensity: 'low' | 'moderate' | 'high' | 'max';
  type: 'strength' | 'cardio' | 'hybrid' | 'flexibility' | 'recovery';
  goals?: string[];
  avoid?: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  duration: string; // e.g., "6 weeks"
  frequency: number;
  split: string;
  phases: Phase[];
  workouts: PlannedWorkout[];
  progressionScheme: string;
  deloadWeek?: number;
}

export interface Phase {
  weeks: string;
  focus: string;
  intensity: string;
  volume: string;
  notes?: string;
}

export interface PlannedWorkout {
  id: string;
  day: number;
  name: string;
  exercises: PlannedExercise[];
  warmup?: WarmupRoutine;
  cooldown?: CooldownRoutine;
  estimatedDuration: number;
  targetRPE?: number;
}

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string; // e.g., "8-12"
  weight?: string; // e.g., "70% 1RM"
  restTime: number;
  tempo?: string;
  notes?: string;
  alternatives?: string[];
}

export interface WarmupRoutine {
  duration: number;
  exercises: WarmupExercise[];
}

export interface WarmupExercise {
  name: string;
  duration?: number;
  reps?: number;
  intensity: 'light' | 'moderate';
}

export interface CooldownRoutine {
  duration: number;
  stretches: Stretch[];
}

export interface Stretch {
  name: string;
  duration: number;
  targetMuscle: string;
}

export interface MealPreferences {
  calories: number;
  protein: number;
  mealType: string;
  cookingTime?: number;
  cuisine?: string[];
  ingredients?: string[];
  avoid?: string[];
  equipment?: string[];
}

export interface MealPlan {
  id: string;
  date: Date;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  shoppingList?: ShoppingItem[];
}

export interface PlannedMeal {
  id: string;
  name: string;
  mealType: string;
  recipe?: Recipe;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: number;
  cookTime: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  imageUrl?: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  substitutions?: string[];
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedCost?: number;
}

export interface FormAnalysis {
  id: string;
  exercise: string;
  date: Date;
  videoUrl?: string;
  frames?: string[];
  overallScore: number;
  issues: FormIssue[];
  improvements: string[];
  goodPoints: string[];
  recommendations: string[];
  comparisonUrl?: string;
}

export interface FormIssue {
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  bodyPart: string;
  issue: string;
  correction: string;
  timestamp?: number;
}

export interface MotivationTrigger {
  type: 'streak-risk' | 'plateau' | 'milestone' | 'struggle' | 'achievement';
  context: any;
}

export interface ExerciseHistory {
  exercise: string;
  currentWeight: number;
  currentReps: number;
  weeksSame: number;
  progressionRate: number;
  personalRecord: number;
  lastPR: Date;
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface ProgressInsight {
  id: string;
  type: 'strength' | 'weight' | 'body-comp' | 'endurance' | 'consistency';
  title: string;
  description: string;
  metric: number;
  trend: 'improving' | 'stable' | 'declining';
  prediction?: Prediction;
  recommendations: string[];
  visualData?: ChartData;
}

export interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  color: string;
  type?: 'line' | 'bar' | 'scatter';
}

export interface VoiceCommand {
  text: string;
  intent: string;
  entities: Entity[];
  confidence: number;
}

export interface Entity {
  type: string;
  value: any;
  start: number;
  end: number;
}

export interface NotificationSchedule {
  id: string;
  type: 'workout' | 'meal' | 'water' | 'sleep' | 'motivation' | 'check-in';
  time: Date;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actions?: NotificationAction[];
  conditions?: NotificationCondition[];
}

export interface NotificationAction {
  label: string;
  action: string;
  payload?: any;
}

export interface NotificationCondition {
  type: string;
  operator: 'equals' | 'greater' | 'less' | 'contains';
  value: any;
}

export interface UserPsychProfile {
  motivationStyle: 'intrinsic' | 'extrinsic' | 'mixed';
  responseToFailure: 'resilient' | 'sensitive' | 'variable';
  preferredFeedback: 'immediate' | 'summary' | 'detailed';
  socialPreference: 'solo' | 'partner' | 'group';
  competitiveness: number; // 0-10
  consistencyScore: number; // 0-100
  stressResponse: 'positive' | 'negative' | 'neutral';
}

export interface StreamResponse {
  chunk: string;
  isComplete: boolean;
  metadata?: any;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  retry?: boolean;
}