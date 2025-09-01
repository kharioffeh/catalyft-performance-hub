import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
}

const planFeatures: PlanFeature[] = [
  {
    name: 'Workout Tracking',
    free: true,
    pro: true,
    elite: true,
  },
  {
    name: 'Exercise Library',
    free: '50 exercises',
    pro: '500+ exercises',
    elite: '1000+ exercises',
  },
  {
    name: 'AI Coaching',
    free: false,
    pro: true,
    elite: true,
  },
  {
    name: 'Progress Analytics',
    free: 'Basic',
    pro: 'Advanced',
    elite: 'Premium',
  },
  {
    name: 'Form Analysis',
    free: false,
    pro: false,
    elite: true,
  },
  {
    name: 'Personal Coaching',
    free: false,
    pro: false,
    elite: true,
  },
  {
    name: 'Custom Meal Plans',
    free: false,
    pro: false,
    elite: true,
  },
  {
    name: 'Priority Support',
    free: false,
    pro: true,
    elite: true,
  },
  {
    name: 'Exclusive Content',
    free: false,
    pro: 'Limited',
    elite: true,
  },
];

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: ['Basic workout tracking', 'Limited exercise library', 'Basic progress insights'],
    gradient: ['#E5E7EB', '#D1D5DB'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'Most popular choice',
    features: ['Unlimited workouts', 'AI coaching & analysis', 'Advanced analytics', 'Premium exercise library'],
    gradient: ['#0078FF', '#0063E6'],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$19.99',
    period: 'month',
    description: 'Ultimate fitness experience',
    features: ['Everything in Pro', 'Form analysis & feedback', '1-on-1 coaching sessions', 'Custom meal plans'],
    gradient: ['#F97316', '#EA580C'],
    popular: false,
  },
];

export const UpgradeScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const handleUpgrade = () => {
    // Handle upgrade logic
    console.log('Upgrading to:', selectedPlan);
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Ionicons name="checkmark" size={20} color={theme.colors.light.success} />
      ) : (
        <Ionicons name="close" size={20} color={theme.colors.light.textTertiary} />
      );
    }
    return (
      <Text style={styles.featureValueText}>{value}</Text>
    );
  };

  const renderPlanCard = (plan: any) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        plan.popular && styles.popularPlanCard,
        selectedPlan === plan.id && styles.selectedPlanCard
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <View style={[
          styles.planIconContainer,
          { backgroundColor: plan.gradient[0] + '20' }
        ]}>
          <Ionicons 
            name={plan.id === 'free' ? 'fitness-outline' : plan.id === 'pro' ? 'star' : 'trophy'} 
            size={24} 
            color={plan.gradient[0]} 
          />
        </View>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planDescription}>{plan.description}</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.period}>/{plan.period}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature: string, index: number) => (
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

      {selectedPlan === plan.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.light.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upgrade Your Experience</Text>
          <Text style={styles.subtitle}>
            Choose the perfect plan to accelerate your fitness journey
          </Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansContainer}>
            {plans.map(renderPlanCard)}
          </View>
        </View>

        {/* Feature Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Feature Comparison</Text>
          <View style={styles.comparisonTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.featureColumn}>
                <Text style={styles.headerText}>Features</Text>
              </View>
              <View style={styles.planColumn}>
                <Text style={styles.headerText}>Free</Text>
              </View>
              <View style={styles.planColumn}>
                <Text style={styles.headerText}>Pro</Text>
              </View>
              <View style={styles.planColumn}>
                <Text style={styles.headerText}>Elite</Text>
              </View>
            </View>

            {/* Table Rows */}
            {planFeatures.map((feature, index) => (
              <View key={index} style={[
                styles.tableRow,
                index % 2 === 0 && styles.tableRowAlternate
              ]}>
                <View style={styles.featureColumn}>
                  <Text style={styles.featureName}>{feature.name}</Text>
                </View>
                <View style={styles.planColumn}>
                  {renderFeatureValue(feature.free)}
                </View>
                <View style={styles.planColumn}>
                  {renderFeatureValue(feature.pro)}
                </View>
                <View style={styles.planColumn}>
                  {renderFeatureValue(feature.elite)}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustSection}>
          <Text style={styles.sectionTitle}>Why Trust Us?</Text>
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color={theme.colors.light.success} />
              </View>
              <Text style={styles.trustTitle}>Secure & Private</Text>
              <Text style={styles.trustDescription}>
                Bank-level security protects your data
              </Text>
            </View>
            
            <View style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="refresh" size={24} color={theme.colors.light.primary} />
              </View>
              <Text style={styles.trustTitle}>Cancel Anytime</Text>
              <Text style={styles.trustDescription}>
                No long-term commitments required
              </Text>
            </View>
            
            <View style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="headset" size={24} color={theme.colors.light.secondary} />
              </View>
              <Text style={styles.trustTitle}>24/7 Support</Text>
              <Text style={styles.trustDescription}>
                Get help whenever you need it
              </Text>
            </View>
            
            <View style={styles.trustItem}>
              <View style={styles.trustIconContainer}>
                <Ionicons name="star" size={24} color={theme.colors.light.warning} />
              </View>
              <Text style={styles.trustTitle}>Proven Results</Text>
              <Text style={styles.trustDescription}>
                Join thousands of success stories
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing for Floating Button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating CTA Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={handleUpgrade}>
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.floatingButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.floatingButtonText}>
              Upgrade to {plans.find(p => p.id === selectedPlan)?.name}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.light.textOnPrimary} />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.trialText}>
          7-day free trial • Cancel anytime
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  scrollView: {
    flex: 1,
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
  plansSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
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
    shadowColor: theme.colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  selectedPlanCard: {
    borderColor: theme.colors.light.primary,
    backgroundColor: theme.colors.light.primary + '05',
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
    fontSize: theme.typography.sizes.large,
    color: theme.colors.light.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
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
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  comparisonSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  comparisonTable: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.light.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.light.borderLight,
  },
  tableRowAlternate: {
    backgroundColor: theme.colors.light.backgroundSecondary,
  },
  featureColumn: {
    flex: 2,
    padding: 16,
    justifyContent: 'center',
  },
  planColumn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  featureName: {
    fontSize: theme.typography.sizes.regular,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.light.text,
  },
  featureValueText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
  },
  trustSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  trustItem: {
    width: (width - 48 - 16) / 2,
    alignItems: 'center',
    textAlign: 'center',
  },
  trustIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  trustDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  bottomSpacing: {
    height: 120,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.light.background,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.light.border,
    alignItems: 'center',
  },
  floatingButton: {
    width: '100%',
    marginBottom: 12,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  floatingButtonText: {
    fontSize: theme.typography.sizes.button,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.textOnPrimary,
  },
  trialText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
  },
});