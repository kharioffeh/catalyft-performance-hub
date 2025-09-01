import Analytics from '@segment/analytics-react-native';
import { Mixpanel } from 'mixpanel-react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';
import { AnalyticsConfig, ValidateEventName, ValidateProperties } from '../config/analytics.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Funnel stages for onboarding
export const ONBOARDING_FUNNEL = {
  STARTED: 'onboarding_funnel_started',
  WELCOME_VIEWED: 'onboarding_funnel_welcome',
  GOALS_SELECTED: 'onboarding_funnel_goals',
  ASSESSMENT_COMPLETED: 'onboarding_funnel_assessment',
  PERSONALIZATION_COMPLETED: 'onboarding_funnel_personalization',
  PLAN_SELECTED: 'onboarding_funnel_plan',
  TUTORIAL_COMPLETED: 'onboarding_funnel_tutorial',
  COMPLETED: 'onboarding_funnel_completed',
};

// Drop-off tracking
interface FunnelStep {
  step: string;
  timestamp: number;
  timeSpent?: number;
  dropped?: boolean;
}

class EnhancedAnalyticsService {
  private static instance: EnhancedAnalyticsService;
  private mixpanel: Mixpanel | null = null;
  private initialized: boolean = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private funnelSteps: Map<string, FunnelStep> = new Map();
  private lastScreen: string | null = null;
  private screenStartTime: number = Date.now();
  
  // Performance metrics
  private performanceMetrics: Map<string, number[]> = new Map();
  
  private constructor() {}

  static getInstance(): EnhancedAnalyticsService {
    if (!EnhancedAnalyticsService.instance) {
      EnhancedAnalyticsService.instance = new EnhancedAnalyticsService();
    }
    return EnhancedAnalyticsService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize Segment
      if (AnalyticsConfig.segment.writeKey) {
        // await Analytics.setup(AnalyticsConfig.segment.writeKey, AnalyticsConfig.segment);
        console.log('Segment setup:', AnalyticsConfig.segment.writeKey);
      }

      // Initialize Mixpanel
      if (AnalyticsConfig.mixpanel.token) {
        this.mixpanel = new Mixpanel(AnalyticsConfig.mixpanel.token, false);
        await this.mixpanel.init();
      }

      // Initialize Crashlytics
      await this.initializeCrashlytics();

      // Start session
      this.startSession();
      
      this.initialized = true;
      console.log('Enhanced Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      crashlytics().recordError(error as Error);
    }
  }

  private async initializeCrashlytics(): Promise<void> {
    if (AnalyticsConfig.crashlytics.enabled) {
      await crashlytics().setCrashlyticsCollectionEnabled(true);
      
      // Set default attributes
      crashlytics().setAttributes({
        platform: Platform.OS,
        platform_version: Platform.Version.toString(),
        environment: __DEV__ ? 'development' : 'production',
      });

      // Log initialization
      crashlytics().log('Analytics service initialized');
    }
  }

  // Enhanced user identification with multiple services
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    this.userId = userId;
    
    // Segment identification
    // Analytics.identify(userId, traits);
    console.log('Segment identify:', userId, traits);
    
    // Mixpanel identification
    if (this.mixpanel) {
      this.mixpanel.identify(userId);
      if (traits) {
        this.mixpanel.getPeople().set(traits);
      }
    }
    
    // Crashlytics user identification
    crashlytics().setUserId(userId);
    
    // Store user ID for offline tracking
    await AsyncStorage.setItem('analytics_user_id', userId);
  }

  // Enhanced event tracking with validation
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized, queueing event:', eventName);
      this.queueEvent(eventName, properties);
      return;
    }

    // Validate event name
    if (!ValidateEventName(eventName)) {
      console.error(`Invalid event name: ${eventName}`);
      return;
    }

    // Validate properties
    if (properties && !ValidateProperties(properties)) {
      console.error(`Invalid properties for event ${eventName}`);
      return;
    }

    const enrichedProperties = this.enrichProperties(properties);

    // Track in Segment
    // Analytics.track(eventName, enrichedProperties);
    console.log('Segment track:', eventName, enrichedProperties);
    
    // Track in Mixpanel
    if (this.mixpanel) {
      this.mixpanel.track(eventName, enrichedProperties);
    }
    
    // Log to Crashlytics for debugging
    crashlytics().log(`Event: ${eventName}`);
    
    if (__DEV__) {
      console.log(`📊 Event: ${eventName}`, enrichedProperties);
    }
  }

  // Funnel tracking for onboarding
  trackFunnelStep(step: string, properties?: Record<string, any>): void {
    const now = Date.now();
    const previousStep = Array.from(this.funnelSteps.values()).pop();
    
    const stepData: FunnelStep = {
      step,
      timestamp: now,
      timeSpent: previousStep ? now - previousStep.timestamp : 0,
    };
    
    this.funnelSteps.set(step, stepData);
    
    // Track the funnel event
    this.track(step, {
      ...properties,
      step_index: this.funnelSteps.size,
      time_spent_seconds: Math.floor((stepData.timeSpent || 0) / 1000),
      previous_step: previousStep?.step,
    });
    
    // Calculate and track drop-off rate
    this.calculateDropOff();
  }

  // Calculate drop-off between funnel steps
  private calculateDropOff(): void {
    const steps = Array.from(this.funnelSteps.values());
    if (steps.length < 2) return;
    
    const lastStep = steps[steps.length - 1];
    const previousStep = steps[steps.length - 2];
    
    // If more than 5 minutes between steps, consider it a drop-off risk
    const timeDiff = lastStep.timestamp - previousStep.timestamp;
    if (timeDiff > 300000) { // 5 minutes
      this.track('funnel_drop_off_risk', {
        from_step: previousStep.step,
        to_step: lastStep.step,
        time_between_steps: Math.floor(timeDiff / 1000),
      });
    }
  }

  // Screen tracking with time spent
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    const now = Date.now();
    
    // Track time spent on previous screen
    if (this.lastScreen) {
      const timeSpent = now - this.screenStartTime;
      this.track('screen_time_spent', {
        screen_name: this.lastScreen,
        time_spent_seconds: Math.floor(timeSpent / 1000),
      });
    }
    
    // Track new screen view
    this.track('screen_viewed', {
      ...properties,
      screen_name: screenName,
      previous_screen: this.lastScreen,
    });
    
    // Update Crashlytics context
    crashlytics().setAttribute('current_screen', screenName);
    
    // Update state
    this.lastScreen = screenName;
    this.screenStartTime = now;
    
    // Track in Segment
    // Analytics.screen(screenName, properties);
    console.log('Segment screen:', screenName, properties);
  }

  // Performance tracking
  startPerformanceTrace(traceName: string): void {
    const startTime = Date.now();
    this.performanceMetrics.set(traceName, [startTime]);
    
    crashlytics().log(`Performance trace started: ${traceName}`);
  }

  endPerformanceTrace(traceName: string, metadata?: Record<string, any>): void {
    const times = this.performanceMetrics.get(traceName);
    if (!times || times.length === 0) {
      console.warn(`No start time found for trace: ${traceName}`);
      return;
    }
    
    const startTime = times[0];
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.track('performance_trace', {
      trace_name: traceName,
      duration_ms: duration,
      ...metadata,
    });
    
    // Log to Crashlytics if performance is poor
    if (duration > 3000) {
      crashlytics().log(`Slow performance detected: ${traceName} took ${duration}ms`);
    }
    
    this.performanceMetrics.delete(traceName);
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>, fatal: boolean = false): void {
    const errorData = {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      is_fatal: fatal,
      ...context,
    };
    
    // Track in analytics
    this.track('error_occurred', errorData);
    
    // Record in Crashlytics
    if (fatal) {
      crashlytics().recordError(error, fatal ? 'Fatal error occurred' : 'Non-fatal error occurred');
    } else {
      crashlytics().log(`Non-fatal error: ${error.message}`);
      crashlytics().recordError(error);
    }
  }

  // Session management
  private startSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.track('session_started', {
      session_id: this.sessionId,
      app_version: '1.0.0',
      platform: Platform.OS,
    });
    
    crashlytics().setAttribute('session_id', this.sessionId);
  }

  endSession(): void {
    if (!this.sessionId) return;
    
    this.track('session_ended', {
      session_id: this.sessionId,
      screens_viewed: this.lastScreen ? 1 : 0,
      funnel_steps_completed: this.funnelSteps.size,
    });
    
    // Clear session data
    this.sessionId = null;
    this.funnelSteps.clear();
  }

  // Queue events for offline support
  private async queueEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    try {
      const queue = await AsyncStorage.getItem('analytics_queue');
      const events = queue ? JSON.parse(queue) : [];
      
      events.push({
        eventName,
        properties,
        timestamp: Date.now(),
      });
      
      await AsyncStorage.setItem('analytics_queue', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to queue event:', error);
    }
  }

  // Process queued events
  async processQueuedEvents(): Promise<void> {
    if (!this.initialized) return;
    
    try {
      const queue = await AsyncStorage.getItem('analytics_queue');
      if (!queue) return;
      
      const events = JSON.parse(queue);
      
      for (const event of events) {
        this.track(event.eventName, {
          ...event.properties,
          queued: true,
          original_timestamp: event.timestamp,
        });
      }
      
      // Clear queue
      await AsyncStorage.removeItem('analytics_queue');
    } catch (error) {
      console.error('Failed to process queued events:', error);
    }
  }

  // Helper to enrich properties
  private enrichProperties(properties?: Record<string, any>): Record<string, any> {
    return {
      ...properties,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      platform_version: Platform.Version,
      app_version: '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
    };
  }

  // Get funnel completion rate
  getFunnelCompletionRate(): number {
    const totalSteps = Object.keys(ONBOARDING_FUNNEL).length;
    const completedSteps = this.funnelSteps.size;
    return (completedSteps / totalSteps) * 100;
  }

  // Get session analytics
  getSessionAnalytics(): Record<string, any> {
    return {
      session_id: this.sessionId,
      funnel_completion: this.getFunnelCompletionRate(),
      steps_completed: Array.from(this.funnelSteps.keys()),
      current_screen: this.lastScreen,
    };
  }

  // Reset analytics (for logout)
  reset(): void {
    this.userId = null;
    this.sessionId = null;
    this.funnelSteps.clear();
    this.lastScreen = null;
    this.performanceMetrics.clear();
    
    // Analytics.reset();
    console.log('Segment reset');
    if (this.mixpanel) {
      this.mixpanel.reset();
    }
  }
}

export default EnhancedAnalyticsService.getInstance();