import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AnalyticsService, { EVENTS } from '../../services/analytics';
import ProgressBar from '../../components/onboarding/ProgressBar';
import Icon from '../../components/ui/Icon';

const { width, height } = Dimensions.get('window');

interface Goal {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

const goals: Goal[] = [
  {
    id: 'lose_weight',
    label: 'Lose Weight',
    emoji: '⚖️',
    color: '#FF6B6B',
  },
  {
    id: 'build_muscle',
    label: 'Build Muscle',
    emoji: '💪',
    color: '#4ECDC4',
  },
  {
    id: 'get_stronger',
    label: 'Get Stronger',
    emoji: '🏋️',
    color: '#6C63FF',
  },
  {
    id: 'improve_endurance',
    label: 'Improve Endurance',
    emoji: '❤️',
    color: '#FF9F1C',
  },
  {
    id: 'general_fitness',
    label: 'General Fitness',
    emoji: '🌟',
    color: '#A8E6CF',
  },
  {
    id: 'sport_specific',
    label: 'Sport Specific',
    emoji: '⚽',
    color: '#FFD93D',
  },
];

const GoalSelectionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const currentStep = 1;
  const totalSteps = 5;

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
      return;
    }

    AnalyticsService.trackGoalSelected(selectedGoals);

    navigation.navigate('PlanSelection');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      
      <View style={styles.header}>
        <Text style={styles.questionTitle}>What brings you here?</Text>
        <Text style={styles.questionSubtitle}>Select all that apply</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goalsGrid}>
          {goals.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.goalCardSelected
              ]}
              onPress={() => toggleGoal(goal.id)}
              activeOpacity={0.8}
            >
              <View style={styles.goalContent}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text style={styles.goalText}>{goal.label}</Text>
                {selectedGoals.includes(goal.id) && (
                  <View style={styles.checkmark}>
                    <Icon name="check" size={16} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton, 
            !selectedGoals.length && styles.buttonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedGoals.length}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#0057FF', '#003FCC']} 
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    minHeight: 120,
    position: 'relative',
  },
  goalCardSelected: {
    backgroundColor: '#F0F8FF',
    borderColor: '#0057FF',
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  goalContent: {
    alignItems: 'center',
    width: '100%',
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#0057FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default GoalSelectionScreen;