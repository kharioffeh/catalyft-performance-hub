import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'free';
export type SubscriptionTier = 'free' | 'pro';

// Helper function to detect user's country/currency
const getUserCurrency = (): { currency: string; symbol: string; price: string } => {
  try {
    // Try to get user's locale from browser
    const userLocale = navigator.language || 'en-US';
    const country = userLocale.split('-')[1]?.toUpperCase();
    
    // UK users get GBP pricing
    if (country === 'GB' || userLocale.toLowerCase().includes('gb')) {
      return { currency: 'GBP', symbol: '£', price: '9.99' };
    }
    
    // Everyone else gets USD pricing
    return { currency: 'USD', symbol: '$', price: '13.99' };
  } catch {
    // Fallback to USD if detection fails
    return { currency: 'USD', symbol: '$', price: '13.99' };
  }
};

interface SubscriptionData {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_status: SubscriptionStatus;
  tier: SubscriptionTier;
  trial_end: string | null;
  subscription_end: string | null;
  auto_subscription_opted_out: boolean | null;
  created_at: string;
  updated_at: string;
}

// Pro tier features - dynamic pricing based on user location
export const getTierFeatures = () => {
  const { currency, symbol, price } = getUserCurrency();
  
  return {
    free: {
      name: 'Free',
      price: 'Free',
      currency: currency,
      features: [
        'Basic workout tracking',
        'Basic calendar view',
        'Community access'
      ],
      limitations: {
        maxWorkouts: Infinity, // Basic workout tracking allowed
        analyticsHistoryDays: 0, // No analytics
        aiChatMessages: 0, // No AI features
        nutritionLogging: false, // No nutrition
        advancedAnalytics: false, // No analytics
        customPrograms: false, // No custom programs
        wearableIntegration: false, // No wearable features
        prioritySupport: false
      }
    },
    pro: {
      name: 'Pro',
      price: `${symbol}${price}/month`,
      currency: currency,
      priceAmount: price,
      features: [
        'Unlimited workout tracking',
        'Full analytics & insights',
        'AI-powered chat assistant',
        'Nutrition logging & tracking',
        'Custom training programs',
        'Wearable device integration',
        'Advanced progress analytics',
        'Priority support'
      ],
      limitations: {
        maxWorkouts: Infinity,
        analyticsHistoryDays: Infinity,
        aiChatMessages: Infinity,
        nutritionLogging: true,
        advancedAnalytics: true,
        customPrograms: true,
        wearableIntegration: true,
        prioritySupport: true
      }
    }
  };
};

// Legacy export for backwards compatibility
export const TIER_FEATURES = getTierFeatures();

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch subscription data
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('billing_customers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      // Determine tier based on status
      const tier: SubscriptionTier = 
        data.plan_status === 'active' || data.plan_status === 'trialing' ? 'pro' : 'free';

      return {
        ...data,
        tier
      } as SubscriptionData;
    },
    enabled: !!user?.id,
  });

  // Start subscription checkout
  const startCheckoutMutation = useMutation({
    mutationFn: async (plan: 'monthly' | 'yearly') => {
      const { currency } = getUserCurrency();
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan, currency }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription (move to free tier)
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled. You'll continue to have Pro access until the end of your billing period, then you'll be moved to the Free tier.",
      });
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
    onError: (error) => {
      console.error('Cancel subscription error:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your Pro subscription has been reactivated. Welcome back!",
      });
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
    onError: (error) => {
      console.error('Reactivate subscription error:', error);
      toast({
        title: "Reactivation Failed",
        description: "Failed to reactivate subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Manage subscription (redirect to customer portal)
  const manageSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { userId: user?.id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Portal session error:', error);
      toast({
        title: "Portal Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Opt out of auto-subscription
  const optOutAutoSubscriptionMutation = useMutation({
    mutationFn: async (optOut: boolean) => {
      const { data, error } = await supabase.functions.invoke('opt-out-auto-subscription', {
        body: { optOut }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.optedOut ? "Auto-subscription disabled" : "Auto-subscription enabled",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    },
    onError: (error) => {
      console.error('Opt-out error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update auto-subscription preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const isTrialing = subscription?.plan_status === 'trialing';
  const isActive = subscription?.plan_status === 'active';
  const isCanceled = subscription?.plan_status === 'canceled';
  const isPastDue = subscription?.plan_status === 'past_due';
  const isFree = subscription?.tier === 'free';
  const isPro = subscription?.tier === 'pro';

  const trialDaysLeft = subscription?.trial_end ? 
    Math.max(0, Math.ceil((new Date(subscription.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const subscriptionEndsAt = subscription?.subscription_end ? new Date(subscription.subscription_end) : null;
  const hasOptedOutAutoSubscription = subscription?.auto_subscription_opted_out === true;

  // Get dynamic tier features based on user location
  const tierFeatures = getTierFeatures();

  // Check if user can access a feature
      const canAccess = (feature: keyof typeof tierFeatures.pro.limitations) => {
      if (!subscription) return false;
      const tier = subscription.tier;
      const limit = tierFeatures[tier].limitations[feature];
    return typeof limit === 'boolean' ? limit : limit > 0;
  };

  // Get feature limit
  const getLimit = (feature: keyof typeof tierFeatures.pro.limitations) => {
    if (!subscription) return tierFeatures.free.limitations[feature];
    return tierFeatures[subscription.tier].limitations[feature];
  };

  const refreshSubscription = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
  };

  return {
    // Data
    subscription,
    isLoading,
    
    // Status checks
    isTrialing,
    isActive,
    isCanceled,
    isPastDue,
    isFree,
    isPro,
    trialDaysLeft,
    subscriptionEndsAt,
    hasOptedOutAutoSubscription,
    
    // Feature access
    canAccess,
    getLimit,
    tierFeatures: subscription ? tierFeatures[subscription.tier] : tierFeatures.free,
    
    // Actions
    startCheckout: (plan: 'monthly' | 'yearly') => startCheckoutMutation.mutate(plan),
    cancelSubscription: () => cancelSubscriptionMutation.mutate(),
    reactivateSubscription: () => reactivateSubscriptionMutation.mutate(),
    manageSubscription: () => manageSubscriptionMutation.mutate(),
    setAutoSubscription: (optOut: boolean) => optOutAutoSubscriptionMutation.mutate(optOut),
    refreshSubscription,
    
    // Loading states
    isStartingCheckout: startCheckoutMutation.isPending,
    isCanceling: cancelSubscriptionMutation.isPending,
    isReactivating: reactivateSubscriptionMutation.isPending,
    isManaging: manageSubscriptionMutation.isPending,
    isUpdatingAutoSubscription: optOutAutoSubscriptionMutation.isPending,
  };
};