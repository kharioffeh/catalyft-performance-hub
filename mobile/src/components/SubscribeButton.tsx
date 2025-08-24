import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../services/supabase';

interface SubscribeButtonProps {
  priceId: string;
  tier: string;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({ priceId, tier }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = React.useState(false);
  
  const handleSubscribe = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login first');
      
      // Create subscription via your Edge Function
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          userId: user.id,
          priceId: priceId,
        }
      });
      
      if (error) throw error;
      
      // If payment needed, show payment sheet
      if (data.clientSecret) {
        await initPaymentSheet({
          paymentIntentClientSecret: data.clientSecret,
          merchantDisplayName: 'Catalyft',
        });
        
        const { error: paymentError } = await presentPaymentSheet();
        if (!paymentError) {
          console.log('Payment successful!');
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handleSubscribe}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.text}>Subscribe to {tier}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
