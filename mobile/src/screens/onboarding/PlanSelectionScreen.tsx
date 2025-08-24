import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AnalyticsService, { EVENTS } from '../../services/analytics';

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  workoutsPerWeek: number;
  estimatedResults: string;
  isPremium: boolean;
  coach?: {
    name: string;
    specialization: string;
    rating: number;
  };
}

const PlanSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { goals, assessment, personalization } = route.params || {};

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscription, setShowSubscription] = useState(false);

  useEffect(() => {
    generatePlans();
  }, []);

  const generatePlans = async () => {
    // Simulate API call to generate AI plans based on user data
    setTimeout(() => {
      const generatedPlans: WorkoutPlan[] = [
        {
          id: 'ai_personalized',
          name: 'AI Personalized Plan',
          description: 'Custom plan tailored specifically to your goals and fitness level',
          duration: '12 weeks',
          difficulty: assessment?.fitnessLevel || 'intermediate',
          focusAreas: goals || ['general_fitness'],
          workoutsPerWeek: assessment?.workoutFrequency || 4,
          estimatedResults: 'Optimal progress based on your profile',
          isPremium: false,
        },
        {
          id: 'strength_focus',
          name: 'Strength Builder',
          description: 'Progressive overload program for maximum strength gains',
          duration: '8 weeks',
          difficulty: 'intermediate',
          focusAreas: ['build_muscle', 'get_stronger'],
          workoutsPerWeek: 4,
          estimatedResults: '15-20% strength increase',
          isPremium: false,
        },
        {
          id: 'fat_loss',
          name: 'Fat Loss Accelerator',
          description: 'High-intensity program combining cardio and resistance training',
          duration: '6 weeks',
          difficulty: 'intermediate',
          focusAreas: ['lose_weight', 'improve_endurance'],
          workoutsPerWeek: 5,
          estimatedResults: '8-12 lbs weight loss',
          isPremium: true,
        },
        {
          id: 'coach_guided',
          name: 'Elite Coach Program',
          description: 'Work 1-on-1 with a certified personal trainer',
          duration: 'Ongoing',
          difficulty: assessment?.fitnessLevel || 'intermediate',
          focusAreas: goals || ['general_fitness'],
          workoutsPerWeek: assessment?.workoutFrequency || 4,
          estimatedResults: 'Guaranteed results with personal accountability',
          isPremium: true,
          coach: {
            name: 'Sarah Johnson',
            specialization: 'Strength & Conditioning',
            rating: 4.9,
          },
        },
      ];

      setPlans(generatedPlans);
      setLoading(false);
    }, 2000);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    
    if (plan?.isPremium) {
      setShowSubscription(true);
    }

    AnalyticsService.track('plan_selected', {
      plan_id: planId,
      plan_name: plan?.name,
      is_premium: plan?.isPremium,
      has_coach: !!plan?.coach,
    });
  };

  const handleContinue = () => {
    if (!selectedPlan) return;

    const plan = plans.find(p => p.id === selectedPlan);
    
    // Track plan selection
    AnalyticsService.track('plan_confirmed', {
      plan_id: selectedPlan,
      plan_name: plan?.name,
      is_premium: plan?.isPremium,
    });

    // Save user profile with all onboarding data
    const userProfile = {
      goals,
      assessment,
      personalization,
      selectedPlan,
    };

    // TODO: Save to backend

    navigation.navigate('Tutorial', { userProfile });
  };

  const renderPlanCard = (plan: WorkoutPlan) => {
    const isSelected = selectedPlan === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, isSelected && styles.planCardSelected]}
        onPress={() => handlePlanSelect(plan.id)}
        activeOpacity={0.8}
      >
        {plan.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}

        {plan.id === 'ai_personalized' && (
          <LinearGradient
            colors={['#6C63FF', '#4ECDC4']}
            style={styles.aiGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={20} color="white" />
            <Text style={styles.aiText}>AI Generated</Text>
          </LinearGradient>
        )}

        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planDescription}>{plan.description}</Text>

        <View style={styles.planDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{plan.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{plan.workoutsPerWeek} days/week</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="fitness-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{plan.difficulty}</Text>
          </View>
        </View>

        <View style={styles.focusAreas}>
          {plan.focusAreas.slice(0, 3).map((area, index) => (
            <View key={index} style={styles.focusChip}>
              <Text style={styles.focusText}>{area.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.resultsContainer}>
          <Ionicons name="trending-up-outline" size={16} color="#4ECDC4" />
          <Text style={styles.resultsText}>{plan.estimatedResults}</Text>
        </View>

        {plan.coach && (
          <View style={styles.coachContainer}>
            <View style={styles.coachAvatar}>
              <Ionicons name="person-circle-outline" size={40} color="#6C63FF" />
            </View>
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{plan.coach.name}</Text>
              <Text style={styles.coachSpecialization}>{plan.coach.specialization}</Text>
              <View style={styles.coachRating}>
                <Ionicons name="star" size={14} color="#FFD93D" />
                <Text style={styles.ratingText}>{plan.coach.rating}</Text>
              </View>
            </View>
          </View>
        )}

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#6C63FF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Creating your personalized plans...</Text>
          <Text style={styles.loadingSubtext}>
            Our AI is analyzing your profile to generate the perfect workout plans
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          We've created these plans based on your goals and preferences
        </Text>

        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        {/* Subscription Upsell */}
        {showSubscription && (
          <View style={styles.subscriptionCard}>
            <LinearGradient
              colors={['#6C63FF', '#4ECDC4']}
              style={styles.subscriptionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.subscriptionTitle}>Unlock Premium Features</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.featureText}>Unlimited AI coaching</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.featureText}>Advanced analytics</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.featureText}>Custom meal plans</Text>
                </View>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.featureText}>Priority support</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.subscribeButton}>
                <Text style={styles.subscribeButtonText}>Start 7-Day Free Trial</Text>
              </TouchableOpacity>
              <Text style={styles.subscriptionTerms}>
                Then $9.99/month. Cancel anytime.
              </Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedPlan}
        >
          <Text style={styles.continueButtonText}>
            {selectedPlan ? 'Start My Journey' : 'Select a Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 15,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    lineHeight: 22,
  },
  plansContainer: {
    gap: 15,
  },
  planCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    position: 'relative',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  premiumBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFD93D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  aiGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
    gap: 6,
  },
  aiText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  planDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  focusChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  focusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  resultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resultsText: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  coachContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  coachAvatar: {
    marginRight: 12,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  coachSpecialization: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  coachRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  subscriptionCard: {
    marginTop: 20,
    marginBottom: 20,
  },
  subscriptionGradient: {
    padding: 25,
    borderRadius: 15,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 25,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: 'white',
  },
  subscribeButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionTerms: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  continueButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlanSelectionScreen;