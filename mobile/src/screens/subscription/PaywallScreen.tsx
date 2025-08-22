import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import StripePaymentService from '../../services/payments/stripe';
import { SUBSCRIPTION_PLANS, CURRENCY } from '../../constants/subscriptions';
import { SubscriptionTier } from '../../types/payments';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TestimonialData {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  transformation?: string;
}

const testimonials: TestimonialData[] = [
  {
    id: '1',
    name: 'Sarah M.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    text: 'Lost 30 lbs in 3 months! The AI coach is like having a personal trainer 24/7.',
    transformation: '-30 lbs',
  },
  {
    id: '2',
    name: 'Mike R.',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    text: 'Finally broke my plateau. The form analysis feature saved me from injury.',
    transformation: '+15 lbs muscle',
  },
  {
    id: '3',
    name: 'Jessica L.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    text: 'The meal planning alone is worth the price. Never been this consistent!',
    transformation: '-25 lbs',
  },
];

const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium_monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnnual, setShowAnnual] = useState(false);
  const scrollY = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    // Pulse animation for CTA button
    pulseAnimation.value = withRepeat(
      withSpring(1.05, { damping: 2, stiffness: 80 }),
      -1,
      true
    );
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const plan = SUBSCRIPTION_PLANS[selectedPlan.toUpperCase()];
      if (!plan?.stripePriceId) {
        Alert.alert('Error', 'Invalid plan selected');
        return;
      }

      const success = await StripePaymentService.presentPaymentSheet(plan.stripePriceId);
      
      if (success) {
        Alert.alert(
          'Welcome to Premium! 🎉',
          'Your subscription is now active. Enjoy all the premium features!',
          [
            {
              text: 'Get Started',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const restored = await StripePaymentService.restorePurchases();
      if (restored) {
        Alert.alert('Success', 'Your purchases have been restored!');
        navigation.goBack();
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ctaButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const renderHeader = () => (
    <Animated.View entering={FadeInUp.delay(100)}>
      <LinearGradient
        colors={['#6B46C1', '#9333EA', '#7C3AED']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <LottieView
            source={require('../../assets/animations/premium-crown.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          
          <Text style={styles.headline}>Unlock Your Full Potential</Text>
          <Text style={styles.subheadline}>
            Join 50,000+ athletes achieving their goals
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>92%</Text>
              <Text style={styles.statLabel}>Hit their goals</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>3.5x</Text>
              <Text style={styles.statLabel}>Faster results</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>4.9★</Text>
              <Text style={styles.statLabel}>App rating</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderTestimonials = () => (
    <Animated.View 
      entering={FadeInUp.delay(200)}
      style={styles.testimonialsSection}
    >
      <Text style={styles.sectionTitle}>Success Stories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.testimonialsScroll}
      >
        {testimonials.map((testimonial) => (
          <View key={testimonial.id} style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <Image
                source={{ uri: testimonial.avatar }}
                style={styles.avatar}
              />
              <View style={styles.testimonialInfo}>
                <Text style={styles.testimonialName}>{testimonial.name}</Text>
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={14}
                      color="#FFD700"
                    />
                  ))}
                </View>
              </View>
              {testimonial.transformation && (
                <View style={styles.transformationBadge}>
                  <Text style={styles.transformationText}>
                    {testimonial.transformation}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.testimonialText}>{testimonial.text}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderPlanSelector = () => {
    const monthlyPlan = showAnnual ? SUBSCRIPTION_PLANS.PREMIUM_YEARLY : SUBSCRIPTION_PLANS.PREMIUM_MONTHLY;
    const elitePlan = showAnnual ? SUBSCRIPTION_PLANS.ELITE_YEARLY : SUBSCRIPTION_PLANS.ELITE_MONTHLY;

    return (
      <Animated.View 
        entering={FadeInUp.delay(300)}
        style={styles.plansSection}
      >
        <View style={styles.planToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, !showAnnual && styles.toggleActive]}
            onPress={() => setShowAnnual(false)}
          >
            <Text style={[styles.toggleText, !showAnnual && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showAnnual && styles.toggleActive]}
            onPress={() => setShowAnnual(true)}
          >
            <Text style={[styles.toggleText, showAnnual && styles.toggleTextActive]}>
              Annual
            </Text>
            {showAnnual && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 33%</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === monthlyPlan.id && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan(monthlyPlan.id)}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{monthlyPlan.name}</Text>
            {!showAnnual && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>{CURRENCY.USD}</Text>
            <Text style={styles.price}>{monthlyPlan.price}</Text>
            <Text style={styles.period}>/{monthlyPlan.interval}</Text>
          </View>

          {monthlyPlan.trial && (
            <Text style={styles.trialText}>
              {monthlyPlan.trial}-day free trial
            </Text>
          )}

          <View style={styles.featuresContainer}>
            {monthlyPlan.features.slice(0, 5).map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>{feature.replace('✓ ', '')}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            styles.elitePlanCard,
            selectedPlan === elitePlan.id && styles.planCardSelected,
          ]}
          onPress={() => setSelectedPlan(elitePlan.id)}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.eliteBadge}
          >
            <Text style={styles.eliteText}>ELITE</Text>
          </LinearGradient>

          <View style={styles.planHeader}>
            <Text style={styles.planName}>{elitePlan.name}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>{CURRENCY.USD}</Text>
            <Text style={styles.price}>{elitePlan.price}</Text>
            <Text style={styles.period}>/{elitePlan.interval}</Text>
          </View>

          {elitePlan.trial && (
            <Text style={styles.trialText}>
              {elitePlan.trial}-day free trial
            </Text>
          )}

          <View style={styles.featuresContainer}>
            {elitePlan.features.slice(0, 6).map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
                <Text style={styles.featureText}>{feature.replace('✓ ', '')}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTrustBadges = () => (
    <Animated.View 
      entering={FadeInUp.delay(400)}
      style={styles.trustSection}
    >
      <View style={styles.trustBadges}>
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.trustText}>Secure Payment</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="refresh" size={24} color="#10B981" />
          <Text style={styles.trustText}>Cancel Anytime</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="lock-closed" size={24} color="#10B981" />
          <Text style={styles.trustText}>SSL Encrypted</Text>
        </View>
      </View>

      <View style={styles.paymentMethods}>
        <Image
          source={require('../../assets/images/payment-methods.png')}
          style={styles.paymentMethodsImage}
          resizeMode="contain"
        />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        {renderTestimonials()}
        {renderPlanSelector()}
        {renderTrustBadges()}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </ScrollView>

      <Animated.View style={[styles.bottomContainer, ctaButtonStyle]}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.ctaText}>
                Start Your Free Trial
              </Text>
              <Text style={styles.ctaSubtext}>
                Then {CURRENCY.USD}{SUBSCRIPTION_PLANS[selectedPlan.toUpperCase()]?.price}/{SUBSCRIPTION_PLANS[selectedPlan.toUpperCase()]?.interval}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Cancel anytime. No commitment required.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  subheadline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  testimonialsSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 20,
    marginBottom: 15,
  },
  testimonialsScroll: {
    paddingHorizontal: 20,
  },
  testimonialCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: SCREEN_WIDTH * 0.8,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  testimonialInfo: {
    marginLeft: 10,
    flex: 1,
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  transformationBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transformationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  testimonialText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  plansSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  planToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  planCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F0FF',
  },
  elitePlanCard: {
    borderColor: '#FFD700',
  },
  eliteBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 12,
  },
  eliteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7C2D12',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  popularBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  currency: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 5,
  },
  trialText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 15,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 10,
    flex: 1,
  },
  trustSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  trustBadge: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  paymentMethods: {
    alignItems: 'center',
  },
  paymentMethodsImage: {
    width: SCREEN_WIDTH * 0.8,
    height: 40,
  },
  restoreButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  restoreText: {
    fontSize: 14,
    color: '#7C3AED',
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  ctaButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  ctaSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PaywallScreen;