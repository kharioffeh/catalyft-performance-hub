
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from './useCurrency';

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
}

interface BillingCustomer {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  role: 'coach' | 'solo';
  plan_id: string | null;
  trial_end: string;
  plan_status: 'trialing' | 'active' | 'past_due' | 'canceled';
  current_athlete_count: number;
  additional_athletes_purchased: number;
  monthly_addon_cost: number;
  preferred_currency: string;
  created_at: string;
  plan?: Plan;
}

interface AthletePurchase {
  id: string;
  athlete_pack_size: number;
  monthly_cost_added: number;
  currency_code: string;
  purchase_date: string;
  is_active: boolean;
}

// Base prices in GBP
const BASE_PRICES = {
  'solo_basic': 7.99,
  'solo_pro': 14.99,
  'coach_basic': 29.99,
  'coach_pro': 49.99,
  'athlete_topup': 4.99, // per 10 athletes
};

export const useBillingEnhanced = () => {
  const { user } = useAuth();
  const { formatPrice, convertPrice, currentCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const { data: billing, isLoading: isBillingLoading } = useQuery({
    queryKey: ['billing-enhanced', user?.id],
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

  const { data: allPlans, isLoading: isPlansLoading } = useQuery({
    queryKey: ['plans-enhanced'],
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

  const { data: athletePurchases = [], isLoading: isPurchasesLoading } = useQuery({
    queryKey: ['athlete-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('athlete_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching athlete purchases:', error);
        return [];
      }

      return data as AthletePurchase[];
    },
    enabled: !!user?.id,
  });

  const startCheckoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_id: planId, currency: currentCurrency?.id }
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

  const purchaseAthletesMutation = useMutation({
    mutationFn: async (athletePackCount: number = 1) => {
      const { data, error } = await supabase.functions.invoke('add-athlete-topup', {
        body: { 
          athlete_pack_count: athletePackCount,
          currency: currentCurrency?.id 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-enhanced', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['athlete-purchases', user?.id] });
      toast({
        title: "Athletes Added",
        description: "Additional athletes have been added to your subscription.",
      });
    },
    onError: (error) => {
      console.error('Athlete purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to add athletes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const refreshBilling = () => {
    queryClient.invalidateQueries({ queryKey: ['billing-enhanced', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['athlete-purchases', user?.id] });
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

  // Calculate pricing with currency conversion
  const getPlanPrice = (planId: string) => {
    const basePrice = BASE_PRICES[planId as keyof typeof BASE_PRICES];
    if (!basePrice) return formatPrice(0);
    return formatPrice(basePrice);
  };

  const planPrice = currentPlan ? getPlanPrice(currentPlan.id) : formatPrice(0);

  // Calculate total monthly cost including add-ons
  const totalMonthlyCost = billing ? 
    BASE_PRICES[billing.plan_id as keyof typeof BASE_PRICES] + billing.monthly_addon_cost : 0;

  // Calculate athlete limits
  const maxAthletes = currentPlan ? (currentPlan.max_athletes || 0) + billing.additional_athletes_purchased : 0;
  const currentAthletes = billing?.current_athlete_count || 0;
  const canAddAthlete = currentPlan?.type === 'solo' || currentAthletes < maxAthletes;

  // Check if user can purchase athlete packs (Coach Pro only)
  const canPurchaseAthletes = currentPlan?.id === 'coach_pro' && billing?.plan_status === 'active';

  // Get plans by type for display
  const coachPlans = allPlans?.filter(p => p.type === 'coach') || [];
  const soloPlans = allPlans?.filter(p => p.type === 'solo') || [];

  return {
    billing,
    currentPlan,
    allPlans,
    coachPlans,
    soloPlans,
    athletePurchases,
    isLoading: isBillingLoading || isPlansLoading || isPurchasesLoading,
    startCheckout: startCheckoutMutation.mutate,
    purchaseAthletes: purchaseAthletesMutation.mutate,
    refreshBilling,
    inTrial,
    daysLeft,
    trialExpired,
    needsUpgrade,
    planName,
    planPrice,
    totalMonthlyCost: formatPrice(totalMonthlyCost),
    maxAthletes,
    currentAthletes,
    canAddAthlete,
    canPurchaseAthletes,
    isCheckingOut: startCheckoutMutation.isPending,
    isPurchasing: purchaseAthletesMutation.isPending,
    getPlanPrice,
  };
};
