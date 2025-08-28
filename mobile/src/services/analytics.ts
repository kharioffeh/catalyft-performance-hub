import Analytics from '@segment/analytics-react-native';
import { Platform } from 'react-native';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

// User properties interface
export interface UserProperties {
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  workout_frequency?: number;
  subscription_type?: 'free' | 'premium' | 'pro';
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  preferred_workout_times?: string[];
  dietary_preferences?: string[];
  notification_preferences?: Record<string, boolean>;
  equipment_available?: string[];
  injuries?: string[];
  time_availability?: number;
  onboarding_completed?: boolean;
  user_id?: string;
  email?: string;
  created_at?: string;
  last_active?: string;
}

// Event names constants
export const EVENTS = {
  // Onboarding Events
  ONBOARDING_STARTED: 'onboarding_started',
  GOAL_SELECTED: 'goal_selected',
  FITNESS_LEVEL_SET: 'fitness_level_set',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  
  // User Behavior Events
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  WORKOUT_PAUSED: 'workout_paused',
  WORKOUT_RESUMED: 'workout_resumed',
  WORKOUT_CANCELLED: 'workout_cancelled',
  EXERCISE_LOGGED: 'exercise_logged',
  MEAL_LOGGED: 'meal_logged',
  SOCIAL_INTERACTION: 'social_interaction',
  CHALLENGE_JOINED: 'challenge_joined',
  ACHIEVEMENT_EARNED: 'achievement_earned',
  
  // Engagement Metrics
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  SCREEN_VIEWED: 'screen_viewed',
  FEATURE_USED: 'feature_used',
  NOTIFICATION_OPENED: 'notification_opened',
  DEEP_LINK_OPENED: 'deep_link_opened',
  
  // Conversion Events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_COMPLETED: 'payment_completed',
  REFERRAL_SENT: 'referral_sent',
  REVIEW_PROMPTED: 'review_prompted',
  REVIEW_SUBMITTED: 'review_submitted',
  
  // Social Events
  POST_CREATED: 'post_created',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented',
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
  MESSAGE_SENT: 'message_sent',
  
  // Error Events
  ERROR_OCCURRED: 'error_occurred',
  CRASH_REPORTED: 'crash_reported',
  
  // Feature Events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SETTINGS_CHANGED: 'settings_changed',
  PROFILE_UPDATED: 'profile_updated',
  PHOTO_UPLOADED: 'photo_uploaded',
  
  // Coach Events
  COACH_ASSIGNED: 'coach_assigned',
  COACH_MESSAGE_SENT: 'coach_message_sent',
  COACH_FEEDBACK_RECEIVED: 'coach_feedback_received',
  
  // Plan Events
  PLAN_CREATED: 'plan_created',
  PLAN_SELECTED: 'plan_selected',
  PLAN_MODIFIED: 'plan_modified',
  PLAN_COMPLETED: 'plan_completed',
};

class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private sessionStartTime: number | null = null;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize(writeKey: string): Promise<void> {
    if (this.initialized) {
      console.warn('Analytics already initialized');
      return;
    }

    try {
      await Analytics.setup(writeKey, {
        trackAppLifecycleEvents: true,
        trackAttributionData: true,
        flushInterval: 20,
        debug: __DEV__,
        trackDeepLinks: true,
        recordScreenViews: true,
      });
      
      this.initialized = true;
      this.startSession();
      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  identify(userId: string, traits?: UserProperties): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    this.userId = userId;
    
    Analytics.identify(userId, {
      ...traits,
      platform: Platform.OS,
      platform_version: Platform.Version,
      app_version: '1.0.0', // TODO: Get from app config
      last_active: new Date().toISOString(),
    });
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const enrichedProperties = {
      ...properties,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    Analytics.track(eventName, enrichedProperties);
    
    if (__DEV__) {
      console.log(`📊 Analytics Event: ${eventName}`, enrichedProperties);
    }
  }

  screen(screenName: string, properties?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    Analytics.screen(screenName, {
      ...properties,
      user_id: this.userId,
      session_id: this.sessionId,
    });
  }

  setUserProperties(properties: UserProperties): void {
    if (!this.initialized || !this.userId) {
      console.warn('Analytics not initialized or user not identified');
      return;
    }

    Analytics.identify(this.userId, properties);
  }

  startSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = Date.now();
    
    this.track(EVENTS.SESSION_STARTED, {
      session_id: this.sessionId,
    });
  }

  endSession(): void {
    if (!this.sessionId || !this.sessionStartTime) {
      return;
    }

    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.track(EVENTS.SESSION_ENDED, {
      session_id: this.sessionId,
      duration_ms: sessionDuration,
      duration_seconds: Math.floor(sessionDuration / 1000),
    });

    this.sessionId = null;
    this.sessionStartTime = null;
  }

  flush(): void {
    if (!this.initialized) {
      return;
    }

    Analytics.flush();
  }

  reset(): void {
    if (!this.initialized) {
      return;
    }

    this.userId = null;
    this.sessionId = null;
    this.sessionStartTime = null;
    Analytics.reset();
  }

  // Convenience methods for common events
  trackWorkoutStarted(workoutId: string, workoutType: string, exerciseCount: number): void {
    this.track(EVENTS.WORKOUT_STARTED, {
      workout_id: workoutId,
      workout_type: workoutType,
      exercise_count: exerciseCount,
    });
  }

  trackWorkoutCompleted(
    workoutId: string,
    duration: number,
    exercisesCount: number,
    totalVolume: number,
    prCount: number = 0
  ): void {
    this.track(EVENTS.WORKOUT_COMPLETED, {
      workout_id: workoutId,
      duration,
      exercises_count: exercisesCount,
      total_volume: totalVolume,
      pr_count: prCount,
    });
  }

  trackGoalSelected(goals: string[]): void {
    this.track(EVENTS.GOAL_SELECTED, {
      goals,
      goal_count: goals.length,
    });
  }

  trackOnboardingCompleted(duration: number, skippedSteps: string[] = []): void {
    this.track(EVENTS.ONBOARDING_COMPLETED, {
      duration_seconds: Math.floor(duration / 1000),
      skipped_steps: skippedSteps,
      skipped_count: skippedSteps.length,
    });
  }

  trackSubscriptionStarted(plan: string, price: number, duration: string): void {
    this.track(EVENTS.SUBSCRIPTION_STARTED, {
      plan,
      price,
      duration,
      currency: 'USD',
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track(EVENTS.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  trackFeatureUsed(featureName: string, metadata?: Record<string, any>): void {
    this.track(EVENTS.FEATURE_USED, {
      feature_name: featureName,
      ...metadata,
    });
  }

  trackScreenView(screenName: string, previousScreen?: string): void {
    this.track(EVENTS.SCREEN_VIEWED, {
      screen_name: screenName,
      previous_screen: previousScreen,
    });
  }
}

export default AnalyticsService.getInstance();