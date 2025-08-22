import { useState, useEffect, useCallback } from 'react';
import StripePaymentService from '../../services/payments/stripe';
import FeatureGateService from '../../services/payments/featureFlags';
import WebhookListener from '../../services/payments/webhookHandler';
import RevenueAnalytics from '../../services/payments/revenueAnalytics';
import { 
  Subscription, 
  Payment, 
  PaymentMethod,
  SubscriptionTier,
  UsageStats,
  RevenueMetrics 
} from '../../types/payments';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hook for subscription management
export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
    
    // Set up real-time listener
    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        (payload) => {
          if (payload.new) {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const sub = await StripePaymentService.getSubscriptionStatus();
      setSubscription(sub);
    } catch (err) {
      setError('Failed to load subscription');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (priceId: string, promoCode?: string) => {
    try {
      setIsLoading(true);
      const success = await StripePaymentService.presentPaymentSheet(priceId, promoCode);
      if (success) {
        await loadSubscription();
      }
      return success;
    } catch (err) {
      setError('Failed to process subscription');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (reason?: string, feedback?: string) => {
    try {
      setIsLoading(true);
      const success = await StripePaymentService.cancelSubscription(reason, feedback);
      if (success) {
        await loadSubscription();
      }
      return success;
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const pauseSubscription = async (resumeDate?: Date) => {
    try {
      setIsLoading(true);
      const success = await StripePaymentService.pauseSubscription(resumeDate);
      if (success) {
        await loadSubscription();
      }
      return success;
    } catch (err) {
      setError('Failed to pause subscription');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resumeSubscription = async () => {
    try {
      setIsLoading(true);
      const success = await StripePaymentService.resumeSubscription();
      if (success) {
        await loadSubscription();
      }
      return success;
    } catch (err) {
      setError('Failed to resume subscription');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentMethod = async () => {
    try {
      setIsLoading(true);
      return await StripePaymentService.updatePaymentMethod();
    } catch (err) {
      setError('Failed to update payment method');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    updatePaymentMethod,
    refresh: loadSubscription,
  };
};

// Hook for feature access
export const useFeatureAccess = (feature: string) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [requiredTier, setRequiredTier] = useState<'Premium' | 'Elite' | undefined>();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      setIsChecking(true);
      const access = await FeatureGateService.checkAccess(feature);
      setHasAccess(access.hasAccess);
      setRequiredTier(access.requiredTier);
    } catch (err) {
      console.error('Failed to check feature access:', err);
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    hasAccess,
    requiredTier,
    isChecking,
    refresh: checkAccess,
  };
};

// Hook for usage limits
export const useUsageLimits = () => {
  const [workoutLimit, setWorkoutLimit] = useState<{
    used: number;
    limit: number;
    withinLimit: boolean;
  } | null>(null);
  
  const [aiChatLimit, setAiChatLimit] = useState<{
    used: number;
    limit: number;
    withinLimit: boolean;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    try {
      setIsLoading(true);
      const [workouts, aiChats] = await Promise.all([
        FeatureGateService.checkUsageLimit('workouts'),
        FeatureGateService.checkUsageLimit('aiChats'),
      ]);
      
      setWorkoutLimit(workouts);
      setAiChatLimit(aiChats);
    } catch (err) {
      console.error('Failed to check usage limits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementWorkout = async () => {
    if (workoutLimit && !workoutLimit.withinLimit) {
      return false;
    }
    // Increment workout count in database
    // This would be handled by your workout tracking service
    await checkLimits();
    return true;
  };

  const incrementAiChat = async () => {
    if (aiChatLimit && !aiChatLimit.withinLimit) {
      return false;
    }
    // Increment AI chat count in database
    await checkLimits();
    return true;
  };

  return {
    workoutLimit,
    aiChatLimit,
    isLoading,
    incrementWorkout,
    incrementAiChat,
    refresh: checkLimits,
  };
};

// Hook for payment history
export const usePaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const history = await StripePaymentService.getPaymentHistory();
      setPayments(history);
    } catch (err) {
      setError('Failed to load payment history');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payments,
    isLoading,
    error,
    refresh: loadPayments,
  };
};

// Hook for trial status
export const useTrialStatus = () => {
  const [isInTrial, setIsInTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const inTrial = await FeatureGateService.isInTrial();
      setIsInTrial(inTrial);
      
      if (inTrial) {
        const daysRemaining = await FeatureGateService.getTrialDaysRemaining();
        setTrialDaysRemaining(daysRemaining);
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + daysRemaining);
        setTrialEndDate(endDate);
      }
    } catch (err) {
      console.error('Failed to check trial status:', err);
    }
  };

  return {
    isInTrial,
    trialDaysRemaining,
    trialEndDate,
    refresh: checkTrialStatus,
  };
};

// Hook for revenue metrics (admin only)
export const useRevenueMetrics = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await RevenueAnalytics.getRevenueMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load revenue metrics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const trackEvent = async (eventName: string, revenue?: number, properties?: any) => {
    await RevenueAnalytics.trackRevenueEvent(eventName, revenue, properties);
  };

  return {
    metrics,
    isLoading,
    error,
    trackEvent,
    refresh: loadMetrics,
  };
};

// Hook for promo code validation
export const usePromoCode = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validatedCode, setValidatedCode] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const validateCode = async (code: string) => {
    try {
      setIsValidating(true);
      setError(null);
      const promo = await StripePaymentService.applyPromoCode(code);
      if (promo) {
        setValidatedCode(promo);
        return promo;
      } else {
        setError('Invalid or expired promo code');
        return null;
      }
    } catch (err) {
      setError('Failed to validate promo code');
      console.error(err);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const clearCode = () => {
    setValidatedCode(null);
    setError(null);
  };

  return {
    validateCode,
    clearCode,
    isValidating,
    validatedCode,
    error,
  };
};

// Hook for subscription initialization
export const useSubscriptionInit = (userId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      initializeServices();
    }
  }, [userId]);

  const initializeServices = async () => {
    try {
      // Initialize all payment services
      await Promise.all([
        StripePaymentService.initialize(userId),
        FeatureGateService.initialize(),
        WebhookListener.initialize(userId),
        RevenueAnalytics.initialize(),
      ]);
      
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to initialize payment services');
      console.error(err);
    }
  };

  return {
    isInitialized,
    error,
  };
};