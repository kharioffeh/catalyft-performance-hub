import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SubscribeButton } from '../components/SubscribeButton';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

// Replace these with your actual Stripe Price IDs
const PRICE_IDS = {
  PRO_MONTHLY: 'price_1RzPozCsuJOQYxCIayRsumXo', // Replace with your actual price ID
  ELITE_MONTHLY: 'price_1RzPr8CsuJOQYxCIft0Xp9oW',    // Replace with your actual price ID
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Basic workout tracking',
      'Limited exercise library',
      'Basic progress insights',
      'Community support'
    ],
    gradient: ['#E5E7EB', '#D1D5DB'],
    icon: 'fitness-outline',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'Most popular choice',
    features: [
      'Unlimited workouts',
      'AI coaching & analysis',
      'Advanced analytics',
      'Premium exercise library',
      'Personalized recommendations',
      'Priority support'
    ],
    gradient: ['#0078FF', '#0063E6'],
    icon: 'star',
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$19.99',
    period: 'month',
    description: 'Ultimate fitness experience',
    features: [
      'Everything in Pro',
      'Form analysis & feedback',
      '1-on-1 coaching sessions',
      'Custom meal plans',
      'Advanced recovery tracking',
      'Exclusive content'
    ],
    gradient: ['#F97316', '#EA580C'],
    icon: 'trophy',
    popular: false
  }
];

export const SubscriptionScreen: React.FC = () => {
  const { subscription, loading, isActive } = useSubscriptionStatus();
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your subscription...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock your full potential with premium features
        </Text>
      </View>

      {/* Current Plan Status */}
      {subscription && (
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.light.success} />
            <Text style={styles.currentPlanTitle}>Active Plan</Text>
          </View>
          <Text style={styles.currentPlanName}>{subscription.tier}</Text>
          <Text style={styles.currentPlanStatus}>
            Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
          </Text>
        </View>
      )}

      {/* Plans Grid */}
      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View key={plan.id} style={[
            styles.planCard,
            plan.popular && styles.popularPlanCard
          ]}>
            {/* Popular Badge */}
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}

            {/* Plan Header */}
            <View style={styles.planHeader}>
              <View style={[
                styles.planIconContainer,
                { backgroundColor: plan.gradient[0] + '20' }
              ]}>
                <Ionicons 
                  name={plan.icon as any} 
                  size={24} 
                  color={plan.gradient[0]} 
                />
              </View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>/{plan.period}</Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={theme.colors.light.success} 
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Action Button */}
            {plan.id === 'free' ? (
              <View style={styles.freePlanButton}>
                <Text style={styles.freePlanText}>Current Plan</Text>
              </View>
            ) : !isActive || subscription?.tier !== plan.name ? (
              <SubscribeButton 
                priceId={plan.id === 'pro' ? PRICE_IDS.PRO_MONTHLY : PRICE_IDS.ELITE_MONTHLY} 
                tier={plan.name} 
              />
            ) : (
              <View style={styles.currentPlanButton}>
                <Text style={styles.currentPlanButtonText}>Current Plan</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Trust Indicators */}
      <View style={styles.trustContainer}>
        <Text style={styles.trustTitle}>Trusted by fitness enthusiasts worldwide</Text>
        <View style={styles.trustFeatures}>
          <View style={styles.trustFeature}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.light.success} />
            <Text style={styles.trustFeatureText}>Secure payments</Text>
          </View>
          <View style={styles.trustFeature}>
            <Ionicons name="refresh" size={20} color={theme.colors.light.primary} />
            <Text style={styles.trustFeatureText}>Cancel anytime</Text>
          </View>
          <View style={styles.trustFeature}>
            <Ionicons name="headset" size={20} color={theme.colors.light.secondary} />
            <Text style={styles.trustFeatureText}>24/7 support</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.light.background,
  },
  loadingText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  currentPlanCard: {
    margin: 24,
    marginTop: 0,
    padding: 20,
    backgroundColor: theme.colors.light.success + '10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.light.success + '20',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPlanTitle: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.success,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  currentPlanName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 4,
  },
  currentPlanStatus: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.light.textSecondary,
  },
  plansContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  planCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.light.border,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  popularPlanCard: {
    borderColor: theme.colors.light.primary,
    borderWidth: 2,
    shadowColor: theme.colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: theme.colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    color: theme.colors.light.textOnPrimary,
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: theme.typography.sizes.display3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
  },
  period: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: theme.typography.sizes.regular,
    color: theme.colors.light.textSecondary,
    marginLeft: 12,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  freePlanButton: {
    backgroundColor: theme.colors.light.neutral100,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  freePlanText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.textSecondary,
  },
  currentPlanButton: {
    backgroundColor: theme.colors.light.success + '20',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.light.success + '30',
  },
  currentPlanButtonText: {
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.success,
  },
  trustContainer: {
    margin: 24,
    marginTop: 32,
    padding: 24,
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderRadius: 16,
    alignItems: 'center',
  },
  trustTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  trustFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  trustFeature: {
    alignItems: 'center',
    flex: 1,
  },
  trustFeatureText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
