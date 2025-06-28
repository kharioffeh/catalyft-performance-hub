
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BillingCustomer {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  role: 'coach' | 'solo';
  trial_end: string;
  plan_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  created_at: string;
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
    mutationFn: async (role: 'coach' | 'solo') => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { role }
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

  const startCheckout = (role: 'coach' | 'solo') => {
    startCheckoutMutation.mutate(role);
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

  const planName = billing?.role === 'coach' ? 'Coach Plan' : 'Solo Plan';
  const planPrice = billing?.role === 'coach' ? '$29/month' : '$9/month';

  return {
    billing,
    isLoading,
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
