import * as amplitude from '@amplitude/analytics-browser';

// Types for analytics events
export interface UserProperties {
  subscription_tier?: 'free' | 'standard' | 'premium';
  subscription_status?: 'active' | 'cancelled' | 'past_due';
  user_type?: 'athlete' | 'coach';
  club_id?: string;
  signup_date?: string;
  platform?: 'web' | 'ios' | 'android';
  wearable_connected?: boolean;
  wearable_types?: string[];
}

export interface SessionTrackingProperties {
  session_id?: string;
  exercise_type?: string;
  session_duration_minutes?: number;
  sets_completed?: number;
  workout_type?: string;
  training_phase?: string;
}

export interface NavigationProperties {
  from_page?: string;
  to_page?: string;
  navigation_method?: 'tab' | 'menu' | 'link' | 'button';
}

export interface FeatureUsageProperties {
  feature_name: string;
  feature_category?: string;
  subscription_required?: boolean;
  success?: boolean;
  error_type?: string;
}

class AnalyticsService {
  private isInitialized = false;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
  }

  /**
   * Initialize Amplitude analytics
   */
  init(): void {
    if (!this.apiKey) {
      console.warn('Amplitude API key not found. Analytics tracking is disabled.');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      amplitude.init(this.apiKey, {
        defaultTracking: {
          attribution: true,
          pageViews: true,
          sessions: true,
          formInteractions: true,
          fileDownloads: true,
        },
        autocapture: {
          attribution: true,
          pageViews: true,
          sessions: true,
          formInteractions: true,
          fileDownloads: true,
        },
      });

      this.isInitialized = true;
      console.log('Amplitude analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }

  /**
   * Set user identity
   */
  setUserId(userId: string): void {
    if (!this.isInitialized) return;
    amplitude.setUserId(userId);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isInitialized) return;
    amplitude.identify(new amplitude.Identify().set(properties));
  }

  /**
   * Update user properties (only changes)
   */
  updateUserProperties(properties: Partial<UserProperties>): void {
    if (!this.isInitialized) return;
    amplitude.identify(new amplitude.Identify().set(properties));
  }

  /**
   * Track user registration
   */
  trackUserRegistration(method: 'email' | 'google' | 'apple', userType: 'athlete' | 'coach'): void {
    this.track('User Registered', {
      registration_method: method,
      user_type: userType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track user login
   */
  trackUserLogin(method: 'email' | 'google' | 'apple'): void {
    this.track('User Logged In', {
      login_method: method,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track user logout
   */
  trackUserLogout(): void {
    this.track('User Logged Out', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track page navigation
   */
  trackNavigation(fromPage: string, toPage: string, method: NavigationProperties['navigation_method'] = 'link'): void {
    this.track('Page Viewed', {
      page: toPage,
      from_page: fromPage,
      navigation_method: method,
    });
  }

  /**
   * Track workout session events
   */
  trackWorkoutStarted(properties: SessionTrackingProperties): void {
    this.track('Workout Started', {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  trackWorkoutCompleted(properties: SessionTrackingProperties & { completion_rate?: number }): void {
    this.track('Workout Completed', {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  trackSetLogged(sessionId: string, exerciseType: string, setNumber: number): void {
    this.track('Set Logged', {
      session_id: sessionId,
      exercise_type: exerciseType,
      set_number: setNumber,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsed(properties: FeatureUsageProperties): void {
    this.track('Feature Used', {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track subscription events
   */
  trackSubscriptionStarted(tier: 'standard' | 'premium', method: 'stripe' | 'apple' | 'google'): void {
    this.track('Subscription Started', {
      subscription_tier: tier,
      payment_method: method,
      timestamp: new Date().toISOString(),
    });
  }

  trackSubscriptionCancelled(tier: 'standard' | 'premium', reason?: string): void {
    this.track('Subscription Cancelled', {
      subscription_tier: tier,
      cancellation_reason: reason,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track wearable integration
   */
  trackWearableConnected(wearableType: 'whoop' | 'garmin' | 'fitbit' | 'apple_watch' | 'google_fit'): void {
    this.track('Wearable Connected', {
      wearable_type: wearableType,
      timestamp: new Date().toISOString(),
    });
  }

  trackWearableDisconnected(wearableType: string): void {
    this.track('Wearable Disconnected', {
      wearable_type: wearableType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track analytics page usage
   */
  trackAnalyticsPageViewed(section: string, timeRange: string): void {
    this.track('Analytics Page Viewed', {
      analytics_section: section,
      time_range: timeRange,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track ARIA (AI coach) interactions
   */
  trackAriaInteraction(interactionType: 'chat' | 'program_adjustment' | 'insights' | 'weekly_summary'): void {
    this.track('ARIA Interaction', {
      interaction_type: interactionType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track errors
   */
  trackError(errorType: string, errorMessage: string, context?: Record<string, any>): void {
    this.track('Error Occurred', {
      error_type: errorType,
      error_message: errorMessage,
      error_context: context,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track social features
   */
  trackPostCreated(postType: 'workout' | 'progress' | 'general'): void {
    this.track('Post Created', {
      post_type: postType,
      timestamp: new Date().toISOString(),
    });
  }

  trackPostReaction(reactionType: 'like' | 'dislike' | 'love' | 'laugh'): void {
    this.track('Post Reaction', {
      reaction_type: reactionType,
      timestamp: new Date().toISOString(),
    });
  }

  trackClubJoined(clubId: string): void {
    this.track('Club Joined', {
      club_id: clubId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generic track method
   */
  private track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn(`Analytics not initialized. Would track: ${eventName}`, properties);
      return;
    }

    try {
      amplitude.track(eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', eventName, error);
    }
  }

  /**
   * Flush events (useful before app closes)
   */
  flush(): void {
    if (!this.isInitialized) return;
    amplitude.flush();
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    if (!this.isInitialized) return;
    amplitude.reset();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export the class for testing
export { AnalyticsService };