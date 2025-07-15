import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  label: string;
  type: 'coach' | 'solo' | 'topup';
  price_id: string;
  max_athletes: number | null;
  has_aria_full: boolean;
  has_adaptive_replan: boolean;
  long_term_analytics: boolean;
  export_api: boolean;
  priority_support: boolean;
  created_at: string;
}

interface BillingCustomer {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  role: 'coach' | 'solo';
  plan_id: string | null;
  trial_end: string;
  plan_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  created_at: string;
  plan?: Plan;
}

export const useBilling = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: billing, isLoading } = useQuery({
    queryKey: ['billing', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('billing_customers')
        .select(`
          *,
          plan:plans(*)
        `)
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

  const { data: allPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .in('type', ['coach', 'solo'])
        .order('type', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        return [];
      }

      return data as Plan[];
    },
  });

  const startCheckoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('create-checkout-enhanced', {
        body: { plan_id: planId, currency: 'GBP' }
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

  const startCheckout = (planId: string) => {
    startCheckoutMutation.mutate(planId);
  };

  const refreshBilling = () => {
    queryClient.invalidateQueries({ queryKey: ['billing', user?.id] });
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

  const currentPlan = billing?.plan;
  const planName = currentPlan?.label || 'Unknown Plan';
  
  // Calculate pricing based on plan type and features
  const getPlanPrice = (plan: Plan) => {
    if (plan.type === 'coach') {
      return plan.has_adaptive_replan ? '£49.99/month' : '£29.99/month';
    } else {
      return plan.has_adaptive_replan ? '£14.99/month' : '£7.99/month';
    }
  };

  const planPrice = currentPlan ? getPlanPrice(currentPlan) : '£0/month';

  // Get plans by type for display
  const coachPlans = allPlans?.filter(p => p.type === 'coach') || [];
  const soloPlans = allPlans?.filter(p => p.type === 'solo') || [];

  return {
    billing,
    currentPlan,
    allPlans,
    coachPlans,
    soloPlans,
    isLoading: isLoading || isLoadingPlans,
    startCheckout,
    refreshBilling,
    inTrial,
    daysLeft,
    trialExpired,
    needsUpgrade,
    planName,
    planPrice,
    isCheckingOut: startCheckoutMutation.isPending,
  };
};
