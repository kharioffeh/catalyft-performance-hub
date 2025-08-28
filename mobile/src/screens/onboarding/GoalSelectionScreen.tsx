import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import EnhancedAnalyticsService, { EVENTS } from '../../services/analytics.enhanced';
import SupabaseAnalyticsService from '../../services/supabaseAnalytics';
import { supabase } from '../../config/supabase';

const { width, height } = Dimensions.get('window');

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  motivation: string;
}

const goals: Goal[] = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn calories and shed pounds',
    icon: 'scale-outline',
    color: '#FF6B6B',
    motivation: 'Every step counts towards your goal!',
  },
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    description: 'Gain strength and muscle mass',
    icon: 'barbell-outline',
    color: '#4ECDC4',
    motivation: 'Strength comes from consistency!',
  },
  {
    id: 'get_stronger',
    title: 'Get Stronger',
    description: 'Increase your overall strength',
    icon: 'fitness-outline',
    color: '#6C63FF',
    motivation: 'Push your limits, grow stronger!',
  },
  {
    id: 'improve_endurance',
    title: 'Improve Endurance',
    description: 'Boost stamina and cardiovascular health',
    icon: 'heart-outline',
    color: '#FF9F1C',
    motivation: 'Endurance builds resilience!',
  },
  {
    id: 'general_fitness',
    title: 'General Fitness',
    description: 'Overall health and wellness',
    icon: 'body-outline',
    color: '#A8E6CF',
    motivation: 'Health is wealth, fitness is freedom!',
  },
  {
    id: 'sport_specific',
    title: 'Sport Specific',
    description: 'Train for a specific sport or activity',
    icon: 'football-outline',
    color: '#FFD93D',
    motivation: 'Master your sport, master yourself!',
  },
];

const GoalSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Assuming 5 onboarding steps

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      // Show error or prompt to select at least one goal
      return;
    }

    EnhancedAnalyticsService.trackGoalSelected(selectedGoals);
    
    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await SupabaseAnalyticsService.initialize(user.id);
      await SupabaseAnalyticsService.saveOnboardingProgress('goals', {
        goals: selectedGoals,
      });
      await SupabaseAnalyticsService.saveUserProfile({
        goals: selectedGoals,
      });
    }

    navigation.navigate('PlanSelection');
  };

  const getProgressPercentage = () => {
    return (currentStep / totalSteps) * 100;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "You're taking the first step towards greatness!",
      "Every expert was once a beginner. You've got this!",
      "Your future self will thank you for starting today!",
      "Small progress is still progress. Keep going!",
      "You're building habits that will last a lifetime!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <LinearGradient
      colors={['#121212', '#1a1a1a', '#0f0f0f']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Progress */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressRing}>
              <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
              <View style={styles.progressCenter}>
                <Text style={styles.progressText}>{currentStep}/{totalSteps}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.title}>What are your fitness goals?</Text>
          <Text style={styles.subtitle}>Select all that apply to get personalized recommendations</Text>
          
          {/* Motivational Message */}
          <View style={styles.motivationContainer}>
            <Ionicons name="star" size={16} color="#00D4FF" />
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
          </View>
        </View>

        {/* Goals Grid */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.goalsGrid}>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoals.includes(goal.id) && styles.selectedGoalCard,
                  { borderColor: goal.color }
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.goalIcon,
                  { backgroundColor: selectedGoals.includes(goal.id) ? goal.color : 'rgba(255, 255, 255, 0.1)' }
                ]}>
                  <Ionicons 
                    name={goal.icon as any} 
                    size={24} 
                    color={selectedGoals.includes(goal.id) ? '#FFFFFF' : goal.color} 
                  />
                </View>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                {selectedGoals.includes(goal.id) && (
                  <View style={styles.motivationBubble}>
                    <Text style={styles.motivationBubbleText}>{goal.motivation}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedGoals.length === 0 && styles.disabledButton
            ]}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00D4FF', '#00FF88']}
              style={styles.gradientButton}
            >
              <Text style={styles.continueButtonText}>
                Continue ({selectedGoals.length} selected)
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 4,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 36,
    width: '0%',
  },
  progressCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  motivationText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 140,
  },
  selectedGoalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 16,
  },
  motivationBubble: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#00D4FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '90%',
  },
  motivationBubbleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default GoalSelectionScreen;