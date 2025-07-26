
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BillingCustomer {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  role: 'solo';
  trial_end: string;
  plan_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  created_at: string;
  additional_athletes_purchased?: number;
  current_athlete_count?: number;
  monthly_addon_cost?: number;
  plan_id?: string;
  preferred_currency?: string;
}

// Solo Pro pricing
const SOLO_PRO_MONTHLY_PRICE = 14.99;

export const useBillingEnhanced = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: billing, isLoading: isBillingLoading } = useQuery({
    queryKey: ['billing-enhanced', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('billing_customers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching billing:', error);
        return null;
      }

      return data as BillingCustomer;
    },
    enabled: !!user?.id,
  });

  const startCheckoutMutation = useMutation({
    mutationFn: async (plan: 'monthly' | 'yearly') => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
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

  const refreshBilling = () => {
    queryClient.invalidateQueries({ queryKey: ['billing-enhanced', user?.id] });
  };

  // Helper functions
  const inTrial = billing ? 
    billing.plan_status === 'trialing' && new Date(billing.trial_end) > new Date() : false;
  
  const daysLeft = billing ? 
    Math.max(0, Math.ceil((new Date(billing.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const trialExpired = billing ? 
    billing.plan_status === 'trialing' && new Date(billing.trial_end) <= new Date() : false;

  const needsUpgrade = billing ? 
    (billing.plan_status === 'past_due' || billing.plan_status === 'canceled' || trialExpired) : false;

  const isSubscribed = billing?.plan_status === 'active';

  // Format pricing
  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;
  const monthlyPrice = formatPrice(SOLO_PRO_MONTHLY_PRICE);
  const yearlyPrice = formatPrice(SOLO_PRO_MONTHLY_PRICE * 12 * 0.8); // 20% discount for yearly

  return {
    billing,
    isLoading: isBillingLoading,
    startCheckout: startCheckoutMutation.mutate,
    refreshBilling,
    inTrial,
    daysLeft,
    trialExpired,
    needsUpgrade,
    isSubscribed,
    monthlyPrice,
    yearlyPrice,
    isCheckingOut: startCheckoutMutation.isPending,
  };
};
