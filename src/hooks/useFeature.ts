
import { useBillingEnhanced } from './useBillingEnhanced';

type FeatureFlag = 
  | 'has_aria_full' 
  | 'has_adaptive_replan' 
  | 'long_term_analytics' 
  | 'export_api' 
  | 'priority_support'
  | 'can_add_athlete'
  | 'can_purchase_athletes';

export const useFeature = (feature: FeatureFlag) => {
  const { 
    currentPlan, 
    canAddAthlete, 
    canPurchaseAthletes, 
    billing,
    isLoading 
  } = useBillingEnhanced();

  if (isLoading || !currentPlan) {
    return { 
      hasFeature: false, 
      isLoading: true,
      planName: '',
      upgradeRequired: false 
    };
  }

  // Special handling for athlete-related features
  if (feature === 'can_add_athlete') {
    return {
      hasFeature: canAddAthlete,
      isLoading: false,
      planName: currentPlan.label,
      upgradeRequired: !canAddAthlete && currentPlan.type === 'coach'
    };
  }

  if (feature === 'can_purchase_athletes') {
    return {
      hasFeature: canPurchaseAthletes,
      isLoading: false,
      planName: currentPlan.label,
      upgradeRequired: !canPurchaseAthletes && currentPlan.type === 'coach'
    };
  }

  // Standard feature flags
  const hasFeature = Boolean(currentPlan[feature]);
  const upgradeRequired = !hasFeature && (
    (feature === 'has_adaptive_replan' && currentPlan.type === 'solo' && currentPlan.id === 'solo_basic') ||
    (feature === 'has_adaptive_replan' && currentPlan.type === 'coach' && currentPlan.id === 'coach_basic') ||
    (feature === 'long_term_analytics' && !currentPlan.long_term_analytics) ||
    (feature === 'export_api' && !currentPlan.export_api) ||
    (feature === 'priority_support' && !currentPlan.priority_support)
  );

  return {
    hasFeature,
    isLoading: false,
    planName: currentPlan.label,
    upgradeRequired
  };
};
