/**
 * Feature Flags Configuration
 * Controls the rollout of new features in production
 */

export const FEATURE_FLAGS = {
  // Onboarding & Analytics Features
  NEW_ONBOARDING_FLOW: {
    enabled: __DEV__ ? true : false, // Enabled in dev, disabled in production
    description: 'New onboarding flow with progressive disclosure',
    rolloutPercentage: 0, // Start with 0% in production
  },
  
  ENHANCED_ANALYTICS: {
    enabled: __DEV__ ? true : false,
    description: 'Enhanced analytics with Segment/Mixpanel integration',
    rolloutPercentage: 0,
  },
  
  AB_TESTING: {
    enabled: __DEV__ ? true : false,
    description: 'A/B testing framework for experiments',
    rolloutPercentage: 0,
  },
  
  PRIVACY_CONSENT: {
    enabled: true, // Always enabled for compliance
    description: 'Privacy consent management for GDPR/CCPA',
    rolloutPercentage: 100,
  },
  
  PERFORMANCE_MONITORING: {
    enabled: __DEV__ ? true : false,
    description: 'Performance monitoring and reporting',
    rolloutPercentage: 0,
  },
  
  ADMIN_DASHBOARD: {
    enabled: __DEV__ ? true : false,
    description: 'Admin analytics dashboard',
    rolloutPercentage: 0,
  },
};

/**
 * Check if a feature is enabled for the current user
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  const flag = FEATURE_FLAGS[feature];
  
  if (!flag.enabled) {
    return false;
  }
  
  // In development, always return true if enabled
  if (__DEV__) {
    return true;
  }
  
  // In production, check rollout percentage
  if (flag.rolloutPercentage === 100) {
    return true;
  }
  
  if (flag.rolloutPercentage === 0) {
    return false;
  }
  
  // Random rollout based on percentage
  // TODO: Use consistent user-based hashing for stable assignment
  return Math.random() * 100 < flag.rolloutPercentage;
};

/**
 * Override feature flags for testing
 * Only works in development mode
 */
export const overrideFeatureFlag = (
  feature: keyof typeof FEATURE_FLAGS,
  enabled: boolean
): void => {
  if (__DEV__) {
    FEATURE_FLAGS[feature].enabled = enabled;
    console.log(`Feature flag ${feature} overridden to ${enabled}`);
  }
};