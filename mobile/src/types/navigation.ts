/**
 * Navigation types for Catalyft mobile app
 */

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  AuthProfile: undefined;
  
  // Main screens
  Dashboard: undefined;
  Training: undefined;
  Analytics: undefined;
  Nutrition: undefined;
  Settings: undefined;
  
  // Workout screens
  WorkoutList: undefined;
  CreateTemplate: { duplicateFrom?: any };
  WorkoutSummary: { workoutId: string };
  WorkoutTemplate: { templateId: string };
  WorkoutDetail: { workoutId: string };
  ShareWorkout: { workoutId: string };
  ActiveWorkout: undefined;
  
  // Social screens
  Social: undefined;
  Profile: { userId: string };
  ChallengeDetails: { challengeId: string };
  
  // Other screens
  About: undefined;
  AccountSettings: undefined;
  AppearanceSettings: undefined;
  DataExport: undefined;
  HelpSupport: undefined;
  UnitsSettings: undefined;
  BillingHistory: undefined;
  PaymentMethod: undefined;
  Paywall: undefined;
  Subscription: undefined;
  Upgrade: undefined;
  GoalTracking: undefined;
  BodyMetrics: undefined;
  ProgressDashboard: undefined;
  StrengthProgress: undefined;
  RestTimer: undefined;
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
  CreateWorkout: undefined;
  AriaChat: undefined;
  EnhancedAnalyticsDashboard: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Training: undefined;
  Analytics: undefined;
  Nutrition: undefined;
  Profile: undefined;
};

export type SocialStackParamList = {
  Social: undefined;
  Profile: { userId: string };
  ChallengeDetails: { challengeId: string };
  Feed: undefined;
  Discover: undefined;
  Leaderboard: undefined;
  Challenges: undefined;
  PrivacySettings: undefined;
  SocialDemo: undefined;
};

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  CreateTemplate: { duplicateFrom?: any };
  WorkoutSummary: { workoutId: string };
  WorkoutTemplate: { templateId: string };
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
  CreateWorkout: undefined;
  RestTimer: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}