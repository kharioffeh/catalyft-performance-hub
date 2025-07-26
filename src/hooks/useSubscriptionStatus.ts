
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  isSubscribed: boolean;
  loading: boolean;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    loading: true,
  });

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Get user billing status
      const { data: billing } = await supabase
        .from('billing_customers')
        .select('plan_status')
        .eq('id', user.id)
        .single();

      setStatus({
        isSubscribed: billing?.plan_status === 'active',
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
