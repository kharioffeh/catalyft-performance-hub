import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface Subscription {
  id: string;
  stripe_subscription_id: string;
  tier: string;
  status: string;
  current_period_end: string;
}

export const useSubscriptionStatus = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSubscription();
    
    // Listen for changes
    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const subscription = supabase
        .channel('subscription-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        }, payload => {
          console.log('Subscription changed:', payload);
          fetchSubscription();
        })
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupListener();
  }, []);
  
  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    subscription, 
    loading, 
    refetch: fetchSubscription,
    isPremium: subscription?.tier === 'Premium',
    isElite: subscription?.tier === 'Elite',
    isActive: subscription?.status === 'active',
  };
};
