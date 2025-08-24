import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SubscribeButton } from '../components/SubscribeButton';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';

// Replace these with your actual Stripe Price IDs
const PRICE_IDS = {
  PREMIUM_MONTHLY: 'price_1RzPozCsuJOQYxCIayRsumXo', // Replace with your actual price ID
  ELITE_MONTHLY: 'price_1RzPr8CsuJOQYxCIft0Xp9oW',    // Replace with your actual price ID
};

export const SubscriptionScreen: React.FC = () => {
  const { subscription, loading, isActive } = useSubscriptionStatus();
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Subscription</Text>
      
      {subscription ? (
        <View style={styles.currentPlan}>
          <Text style={styles.planTitle}>Current Plan: {subscription.tier}</Text>
          <Text>Status: {subscription.status}</Text>
          <Text>Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</Text>
        </View>
      ) : (
        <Text style={styles.noPlan}>No active subscription</Text>
      )}
      
      <View style={styles.plans}>
        <View style={styles.planCard}>
          <Text style={styles.planName}>Premium</Text>
          <Text style={styles.price}>$9.99/month</Text>
          <Text>• Unlimited workouts</Text>
          <Text>• AI coaching</Text>
          <Text>• Advanced analytics</Text>
          {!isActive || subscription?.tier !== 'Premium' ? (
            <SubscribeButton 
              priceId={PRICE_IDS.PREMIUM_MONTHLY} 
              tier="Premium" 
            />
          ) : (
            <Text style={styles.current}>Current Plan</Text>
          )}
        </View>
        
        <View style={styles.planCard}>
          <Text style={styles.planName}>Elite</Text>
          <Text style={styles.price}>$19.99/month</Text>
          <Text>• Everything in Premium</Text>
          <Text>• Form analysis</Text>
          <Text>• Personal coaching</Text>
          {!isActive || subscription?.tier !== 'Elite' ? (
            <SubscribeButton 
              priceId={PRICE_IDS.ELITE_MONTHLY} 
              tier="Elite" 
            />
          ) : (
            <Text style={styles.current}>Current Plan</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  currentPlan: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noPlan: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  plans: {
    gap: 20,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 10,
  },
  current: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
});
