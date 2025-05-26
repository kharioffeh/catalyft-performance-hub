
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  isSubscribed: boolean;
  plan: any;
  athleteCount: number;
  athleteLimit: number | null;
  canAddAthlete: boolean;
  loading: boolean;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    plan: null,
    athleteCount: 0,
    athleteLimit: null,
    canAddAthlete: false,
    loading: true,
  });

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Get user subscription with plan details
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      // Get current athlete count
      const { data: athleteCountData } = await supabase
        .rpc('get_user_athlete_count', { user_uuid: user.id });

      // Check if user can add more athletes
      const { data: canAddData } = await supabase
        .rpc('can_add_athlete', { user_uuid: user.id });

      setStatus({
        isSubscribed: !!subscription,
        plan: subscription?.plan || null,
        athleteCount: athleteCountData || 0,
        athleteLimit: subscription?.plan?.athlete_limit || null,
        canAddAthlete: canAddData || false,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  return { ...status, refresh: fetchSubscriptionStatus };
};
