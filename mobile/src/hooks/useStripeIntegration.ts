import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import userLinking from '../services/payments/userLinking';

export const useStripeIntegration = () => {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeStripeCustomer();
  }, []);

  const initializeStripeCustomer = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const stripeCustomerId = await userLinking.ensureStripeCustomer(user.id);
        setCustomerId(stripeCustomerId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (priceId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');
      
      const result = await userLinking.createSubscription(user.id, priceId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    customerId,
    loading,
    error,
    createSubscription,
    refreshCustomer: initializeStripeCustomer,
  };
};
