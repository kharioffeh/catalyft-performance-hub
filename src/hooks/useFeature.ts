
import { useBilling } from './useBilling';

type FeatureFlag = 
  | 'has_aria_full' 
  | 'has_adaptive_replan' 
  | 'long_term_analytics' 
  | 'export_api' 
  | 'priority_support';

export const useFeature = (feature: FeatureFlag) => {
  const { isSubscribed, isLoading } = useBilling();

  if (isLoading) {
    return { 
      hasFeature: false, 
      isLoading: true,
      planName: 'Solo Pro',
      upgradeRequired: false 
    };
  }

  // Solo Pro includes all features
  return {
    hasFeature: isSubscribed, // All features are available with Solo Pro subscription
    isLoading: false,
    planName: 'Solo Pro',
    upgradeRequired: !isSubscribed // Upgrade required if not subscribed
  };
};
