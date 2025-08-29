import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const benefits = [
  {
    icon: 'fitness',
    title: 'Unlimited Workouts',
    description: 'Access to our complete library of workouts and exercises'
  },
  {
    icon: 'brain',
    title: 'AI Coaching',
    description: 'Personalized recommendations and form analysis'
  },
  {
    icon: 'analytics',
    title: 'Advanced Analytics',
    description: 'Track your progress with detailed insights and trends'
  },
  {
    icon: 'people',
    title: 'Expert Community',
    description: 'Connect with fitness enthusiasts and certified trainers'
  },
  {
    icon: 'trophy',
    title: 'Premium Content',
    description: 'Exclusive workout plans and nutrition guidance'
  },
  {
    icon: 'shield-checkmark',
    title: 'Priority Support',
    description: 'Get help when you need it with dedicated support'
  }
];

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'Transformed my fitness journey completely!',
    rating: 5
  },
  {
    name: 'Mike R.',
    text: 'The AI coaching is incredible. Best investment ever!',
    rating: 5
  },
  {
    name: 'Emma L.',
    text: 'Finally found an app that actually works for me.',
    rating: 5
  }
];

export const PaywallScreen: React.FC = () => {
  const handleUpgrade = () => {
    // Handle upgrade logic
    console.log('Upgrade pressed');
  };

  const handleRestore = () => {
    // Handle restore purchases logic
    console.log('Restore pressed');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={theme.colors.light.gradients.workout}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="fitness" size={48} color={theme.colors.light.textOnPrimary} />
            </View>
            <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
            <Text style={styles.heroSubtitle}>
              Join thousands of fitness enthusiasts who have transformed their lives
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Why Choose Premium?</Text>
        <Text style={styles.sectionSubtitle}>
          Get access to features that will accelerate your fitness journey
        </Text>
        
        <View style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIconContainer}>
                <Ionicons 
                  name={benefit.icon as any} 
                  size={24} 
                  color={theme.colors.light.primary} 
                />
              </View>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Social Proof */}
      <View style={styles.testimonialsSection}>
        <Text style={styles.sectionTitle}>What Our Users Say</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
          {testimonials.map((testimonial, index) => (
            <View key={index} style={styles.testimonialCard}>
              <View style={styles.ratingContainer}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color={theme.colors.light.warning} />
                ))}
              </View>
              <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
              <Text style={styles.testimonialName}>- {testimonial.name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Pricing Section */}
      <View style={styles.pricingSection}>
        <View style={styles.pricingCard}>
          <View style={styles.pricingHeader}>
            <Text style={styles.pricingTitle}>Pro Plan</Text>
            <Text style={styles.pricingSubtitle}>Most Popular Choice</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$9.99</Text>
            <Text style={styles.period}>/month</Text>
          </View>
          
          <Text style={styles.pricingDescription}>
            Cancel anytime. No commitment required.
          </Text>
          
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <LinearGradient
              colors={theme.colors.light.gradients.primary}
              style={styles.upgradeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.light.textOnPrimary} />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.trialText}>7-day free trial, then $9.99/month</Text>
        </View>
      </View>

      {/* Trust Indicators */}
      <View style={styles.trustSection}>
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.light.success} />
            <Text style={styles.trustText}>Secure Payment</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh" size={20} color={theme.colors.light.primary} />
            <Text style={styles.trustText}>Cancel Anytime</Text>
          </View>
        </View>
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="headset" size={20} color={theme.colors.light.secondary} />
            <Text style={styles.trustText}>24/7 Support</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.light.info} />
            <Text style={styles.trustText}>Privacy Protected</Text>
          </View>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={styles.footerSection}>
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  heroSection: {
    height: height * 0.4,
    marginBottom: 32,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: theme.typography.sizes.display3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.textOnPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: theme.typography.lineHeights.tight,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.large,
    color: theme.colors.light.textOnPrimary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
    opacity: 0.9,
  },
  benefitsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  testimonialsSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  testimonialsScroll: {
    marginTop: 24,
  },
  testimonialCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    width: width * 0.7,
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.text,
    lineHeight: theme.typography.lineHeights.relaxed,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testimonialName: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  pricingSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  pricingCard: {
    backgroundColor: theme.colors.light.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: theme.colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pricingTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
    marginBottom: 8,
  },
  pricingSubtitle: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: theme.typography.sizes.display2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.light.text,
  },
  period: {
    fontSize: theme.typography.sizes.large,
    color: theme.colors.light.textSecondary,
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: 16,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
  },
  upgradeButtonText: {
    fontSize: theme.typography.sizes.button,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.light.textOnPrimary,
  },
  trialText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
  },
  trustSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  trustText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    marginLeft: 8,
    fontWeight: theme.typography.weights.medium,
  },
  footerSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  restoreButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  restoreButtonText: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.medium,
  },
  termsText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  termsLink: {
    color: theme.colors.light.primary,
    fontWeight: theme.typography.weights.medium,
  },
});