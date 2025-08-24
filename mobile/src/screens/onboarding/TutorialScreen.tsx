import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AnalyticsService, { EVENTS } from '../../services/analytics';

const { width, height } = Dimensions.get('window');

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  gesture?: 'tap' | 'swipe' | 'longpress' | 'pinch';
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Track your progress, view upcoming workouts, and see your achievements all in one place',
    icon: 'home-outline',
    gesture: 'tap',
  },
  {
    id: 'workout',
    title: 'Start a Workout',
    description: 'Tap the workout button to begin your personalized training session with real-time guidance',
    icon: 'fitness-outline',
    gesture: 'tap',
  },
  {
    id: 'swipe_exercises',
    title: 'Swipe Through Exercises',
    description: 'Swipe left or right to navigate between exercises during your workout',
    icon: 'swap-horizontal-outline',
    gesture: 'swipe',
  },
  {
    id: 'log_sets',
    title: 'Log Your Sets',
    description: 'Tap to log completed sets and track your reps, weight, and rest times',
    icon: 'checkmark-circle-outline',
    gesture: 'tap',
  },
  {
    id: 'nutrition',
    title: 'Track Nutrition',
    description: 'Log your meals and monitor your calorie intake to support your fitness goals',
    icon: 'restaurant-outline',
    gesture: 'tap',
  },
  {
    id: 'social',
    title: 'Connect with Others',
    description: 'Share your progress, join challenges, and get motivated by the community',
    icon: 'people-outline',
    gesture: 'tap',
  },
  {
    id: 'ai_coach',
    title: 'AI Coach Assistant',
    description: 'Long press anywhere to activate your AI coach for instant form tips and motivation',
    icon: 'sparkles-outline',
    gesture: 'longpress',
  },
  {
    id: 'progress',
    title: 'View Progress',
    description: 'Pinch to zoom on charts and graphs to see detailed progress analytics',
    icon: 'trending-up-outline',
    gesture: 'pinch',
  },
];

const TutorialScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userProfile } = route.params || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [gestureCompleted, setGestureCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep(currentStep + 1);
      setGestureCompleted(false);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    AnalyticsService.track('tutorial_skipped', {
      step_index: currentStep,
      step_id: tutorialSteps[currentStep].id,
    });
    completeTutorial();
  };

  const completeTutorial = () => {
    const onboardingEndTime = Date.now();
    
    AnalyticsService.track(EVENTS.TUTORIAL_COMPLETED, {
      steps_completed: currentStep + 1,
      total_steps: tutorialSteps.length,
    });

    AnalyticsService.track(EVENTS.ONBOARDING_COMPLETED, {
      user_profile: userProfile,
    });

    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleGesture = (gesture: string) => {
    const step = tutorialSteps[currentStep];
    if (step.gesture === gesture) {
      setGestureCompleted(true);
      
      // Animate success
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      AnalyticsService.track('tutorial_gesture_completed', {
        step_id: step.id,
        gesture_type: gesture,
      });
    }
  };

  const handleSwipeGesture = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;
      if (Math.abs(translationX) > 50) {
        handleGesture('swipe');
      }
    }
  };

  const renderGestureDemo = () => {
    const step = tutorialSteps[currentStep];
    
    return (
      <View style={styles.gestureContainer}>
        <Animated.View
          style={[
            styles.gestureIcon,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons
            name={step.icon as any}
            size={80}
            color={gestureCompleted ? '#4ECDC4' : '#6C63FF'}
          />
        </Animated.View>

        {step.gesture && !gestureCompleted && (
          <View style={styles.gestureHint}>
            {step.gesture === 'tap' && (
              <TouchableOpacity
                style={styles.tapArea}
                onPress={() => handleGesture('tap')}
              >
                <Text style={styles.gestureText}>Tap here to try</Text>
              </TouchableOpacity>
            )}
            
            {step.gesture === 'swipe' && (
              <PanGestureHandler onGestureEvent={handleSwipeGesture}>
                <View style={styles.swipeArea}>
                  <Ionicons name="swap-horizontal" size={30} color="#6C63FF" />
                  <Text style={styles.gestureText}>Swipe left or right</Text>
                </View>
              </PanGestureHandler>
            )}
            
            {step.gesture === 'longpress' && (
              <TouchableOpacity
                style={styles.longPressArea}
                onLongPress={() => handleGesture('longpress')}
                delayLongPress={500}
              >
                <Text style={styles.gestureText}>Long press here</Text>
              </TouchableOpacity>
            )}
            
            {step.gesture === 'pinch' && (
              <View style={styles.pinchArea}>
                <Ionicons name="resize" size={30} color="#6C63FF" />
                <Text style={styles.gestureText}>Pinch to zoom</Text>
              </View>
            )}
          </View>
        )}

        {gestureCompleted && (
          <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-circle" size={30} color="#4ECDC4" />
            <Text style={styles.successText}>Perfect! You got it!</Text>
          </Animated.View>
        )}
      </View>
    );
  };

  const step = tutorialSteps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {tutorialSteps.length}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Animated.View>

        {renderGestureDemo()}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !gestureCompleted && step.gesture && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!gestureCompleted && !!step.gesture}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === tutorialSteps.length - 1 ? "Let's Go!" : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    flex: 1,
    marginRight: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureIcon: {
    marginBottom: 30,
  },
  gestureHint: {
    alignItems: 'center',
  },
  gestureText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
  },
  tapArea: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  swipeArea: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 60,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  longPressArea: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  pinchArea: {
    backgroundColor: 'white',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#4ECDC410',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  successText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
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
  nextButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCC',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TutorialScreen;