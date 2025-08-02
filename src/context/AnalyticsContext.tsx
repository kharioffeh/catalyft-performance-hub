import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analyticsService, UserProperties, SessionTrackingProperties, FeatureUsageProperties } from '../services/analyticsService';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';

interface AnalyticsContextType {
  // User tracking
  setUserId: (userId: string) => void;
  setUserProperties: (properties: UserProperties) => void;
  updateUserProperties: (properties: Partial<UserProperties>) => void;
  
  // Auth tracking
  trackUserRegistration: (method: 'email' | 'google' | 'apple', userType: 'athlete' | 'coach') => void;
  trackUserLogin: (method: 'email' | 'google' | 'apple') => void;
  trackUserLogout: () => void;
  
  // Navigation tracking
  trackNavigation: (fromPage: string, toPage: string, method?: 'tab' | 'menu' | 'link' | 'button') => void;
  
  // Workout tracking
  trackWorkoutStarted: (properties: SessionTrackingProperties) => void;
  trackWorkoutCompleted: (properties: SessionTrackingProperties & { completion_rate?: number }) => void;
  trackSetLogged: (sessionId: string, exerciseType: string, setNumber: number) => void;
  
  // Feature usage
  trackFeatureUsed: (properties: FeatureUsageProperties) => void;
  
  // Subscription tracking
  trackSubscriptionStarted: (tier: 'standard' | 'premium', method: 'stripe' | 'apple' | 'google') => void;
  trackSubscriptionCancelled: (tier: 'standard' | 'premium', reason?: string) => void;
  
  // Wearable tracking
  trackWearableConnected: (wearableType: 'whoop' | 'garmin' | 'fitbit' | 'apple_watch' | 'google_fit') => void;
  trackWearableDisconnected: (wearableType: string) => void;
  
  // Analytics page tracking
  trackAnalyticsPageViewed: (section: string, timeRange: string) => void;
  
  // ARIA interactions
  trackAriaInteraction: (interactionType: 'chat' | 'program_adjustment' | 'insights' | 'weekly_summary') => void;
  
  // Error tracking
  trackError: (errorType: string, errorMessage: string, context?: Record<string, any>) => void;
  
  // Social features
  trackPostCreated: (postType: 'workout' | 'progress' | 'general') => void;
  trackPostReaction: (reactionType: 'like' | 'dislike' | 'love' | 'laugh') => void;
  trackClubJoined: (clubId: string) => void;
  
  // Utility methods
  flush: () => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();

  // Initialize analytics service
  useEffect(() => {
    analyticsService.init();
  }, []);

  // Set user identity when user changes
  useEffect(() => {
    if (user?.id) {
      analyticsService.setUserId(user.id);
      
      // Set initial user properties
      const userProperties: UserProperties = {
        user_type: user.user_metadata?.user_type || 'athlete',
        signup_date: user.created_at,
        platform: 'web', // This would be 'ios' or 'android' for mobile
      };

      // Add subscription information if available
      if (subscription) {
        userProperties.subscription_tier = subscription.tier;
        userProperties.subscription_status = subscription.status;
      }

      analyticsService.setUserProperties(userProperties);
    }
  }, [user, subscription]);

  // Update subscription properties when subscription changes
  useEffect(() => {
    if (subscription && user?.id) {
      analyticsService.updateUserProperties({
        subscription_tier: subscription.tier,
        subscription_status: subscription.status,
      });
    }
  }, [subscription, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analyticsService.flush();
    };
  }, []);

  const contextValue: AnalyticsContextType = {
    setUserId: analyticsService.setUserId.bind(analyticsService),
    setUserProperties: analyticsService.setUserProperties.bind(analyticsService),
    updateUserProperties: analyticsService.updateUserProperties.bind(analyticsService),
    trackUserRegistration: analyticsService.trackUserRegistration.bind(analyticsService),
    trackUserLogin: analyticsService.trackUserLogin.bind(analyticsService),
    trackUserLogout: analyticsService.trackUserLogout.bind(analyticsService),
    trackNavigation: analyticsService.trackNavigation.bind(analyticsService),
    trackWorkoutStarted: analyticsService.trackWorkoutStarted.bind(analyticsService),
    trackWorkoutCompleted: analyticsService.trackWorkoutCompleted.bind(analyticsService),
    trackSetLogged: analyticsService.trackSetLogged.bind(analyticsService),
    trackFeatureUsed: analyticsService.trackFeatureUsed.bind(analyticsService),
    trackSubscriptionStarted: analyticsService.trackSubscriptionStarted.bind(analyticsService),
    trackSubscriptionCancelled: analyticsService.trackSubscriptionCancelled.bind(analyticsService),
    trackWearableConnected: analyticsService.trackWearableConnected.bind(analyticsService),
    trackWearableDisconnected: analyticsService.trackWearableDisconnected.bind(analyticsService),
    trackAnalyticsPageViewed: analyticsService.trackAnalyticsPageViewed.bind(analyticsService),
    trackAriaInteraction: analyticsService.trackAriaInteraction.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
    trackPostCreated: analyticsService.trackPostCreated.bind(analyticsService),
    trackPostReaction: analyticsService.trackPostReaction.bind(analyticsService),
    trackClubJoined: analyticsService.trackClubJoined.bind(analyticsService),
    flush: analyticsService.flush.bind(analyticsService),
    reset: analyticsService.reset.bind(analyticsService),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};