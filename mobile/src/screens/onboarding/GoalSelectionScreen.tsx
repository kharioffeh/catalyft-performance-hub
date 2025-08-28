import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import EnhancedAnalyticsService, { EVENTS } from '../../services/analytics.enhanced';
import SupabaseAnalyticsService from '../../services/supabaseAnalytics';
import { supabase } from '../../config/supabase';

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const goals: Goal[] = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn calories and shed pounds',
    icon: 'scale-outline',
    color: '#FF6B6B',
  },
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    description: 'Gain strength and muscle mass',
    icon: 'barbell-outline',
    color: '#4ECDC4',
  },
  {
    id: 'get_stronger',
    title: 'Get Stronger',
    description: 'Increase your overall strength',
    icon: 'fitness-outline',
    color: '#6C63FF',
  },
  {
    id: 'improve_endurance',
    title: 'Improve Endurance',
    description: 'Boost stamina and cardiovascular health',
    icon: 'heart-outline',
    color: '#FF9F1C',
  },
  {
    id: 'general_fitness',
    title: 'General Fitness',
    description: 'Overall health and wellness',
    icon: 'body-outline',
    color: '#A8E6CF',
  },
  {
    id: 'sport_specific',
    title: 'Sport Specific',
    description: 'Train for a specific sport or activity',
    icon: 'football-outline',
    color: '#FFD93D',
  },
];

const GoalSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

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
    
    navigation.navigate('FitnessAssessment', { goals: selectedGoals });
  };

  const renderGoalCard = (goal: Goal) => {
    const isSelected = selectedGoals.includes(goal.id);
    
    return (
      <TouchableOpacity
        key={goal.id}
        style={[
          styles.goalCard,
          isSelected && styles.goalCardSelected,
          { borderColor: isSelected ? goal.color : '#E0E0E0' },
        ]}
        onPress={() => toggleGoal(goal.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
          <Ionicons name={goal.icon as any} size={32} color={goal.color} />
        </View>
        <View style={styles.goalTextContainer}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: goal.color }]}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          <View style={[styles.progressFill, { width: '20%' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What are your fitness goals?</Text>
        <Text style={styles.subtitle}>
          Select all that apply. We'll create a personalized plan for you.
        </Text>

        <View style={styles.goalsContainer}>
          {goals.map(renderGoalCard)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedGoals.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
        >
          <Text style={styles.continueButtonText}>
            Continue {selectedGoals.length > 0 && `(${selectedGoals.length} selected)`}
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
    marginBottom: 30,
    lineHeight: 22,
  },
  goalsContainer: {
    gap: 15,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  goalCardSelected: {
    borderWidth: 2,
    elevation: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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

export default GoalSelectionScreen;