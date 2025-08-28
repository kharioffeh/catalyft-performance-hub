import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import GoalSelectionScreen from '../screens/onboarding/GoalSelectionScreen';
import FitnessAssessmentScreen from '../screens/onboarding/FitnessAssessmentScreen';
import PersonalizationScreen from '../screens/onboarding/PersonalizationScreen';
import PlanSelectionScreen from '../screens/onboarding/PlanSelectionScreen';
import TutorialScreen from '../screens/onboarding/TutorialScreen';
import EnhancedAnalyticsService from '../services/analytics.enhanced';
import SupabaseAnalyticsService from '../services/supabaseAnalytics';

// Mock navigation
const Stack = createStackNavigator();

const OnboardingNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="FitnessAssessment" component={FitnessAssessmentScreen} />
      <Stack.Screen name="Personalization" component={PersonalizationScreen} />
      <Stack.Screen name="PlanSelection" component={PlanSelectionScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

// Mock services
jest.mock('../services/analytics.enhanced');
jest.mock('../services/supabaseAnalytics');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Onboarding Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Welcome Screen', () => {
    test('should render welcome screen with slides', () => {
      const { getByText } = render(<OnboardingNavigator />);
      
      expect(getByText(/Welcome to Catalyft/i)).toBeTruthy();
      expect(getByText(/Your AI-powered fitness companion/i)).toBeTruthy();
    });

    test('should track analytics when starting onboarding', async () => {
      const { getByText } = render(<OnboardingNavigator />);
      
      const getStartedButton = getByText(/Get Started/i);
      fireEvent.press(getStartedButton);
      
      await waitFor(() => {
        expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
          'onboarding_started',
          expect.any(Object)
        );
      });
    });

    test('should allow skipping onboarding', () => {
      const { getByText } = render(<OnboardingNavigator />);
      
      const skipButton = getByText(/Skip/i);
      expect(skipButton).toBeTruthy();
      
      fireEvent.press(skipButton);
      
      expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
        'onboarding_skipped',
        expect.any(Object)
      );
    });
  });

  describe('Goal Selection Screen', () => {
    test('should display fitness goals', async () => {
      const { getByText } = render(<GoalSelectionScreen />);
      
      expect(getByText(/What are your fitness goals/i)).toBeTruthy();
      expect(getByText(/Lose Weight/i)).toBeTruthy();
      expect(getByText(/Build Muscle/i)).toBeTruthy();
      expect(getByText(/Get Stronger/i)).toBeTruthy();
    });

    test('should allow selecting multiple goals', async () => {
      const { getByText } = render(<GoalSelectionScreen />);
      
      const loseWeightGoal = getByText(/Lose Weight/i);
      const buildMuscleGoal = getByText(/Build Muscle/i);
      
      fireEvent.press(loseWeightGoal);
      fireEvent.press(buildMuscleGoal);
      
      const continueButton = getByText(/Continue.*2 selected/i);
      expect(continueButton).toBeTruthy();
    });

    test('should track goal selection', async () => {
      const { getByText } = render(<GoalSelectionScreen />);
      
      const goal = getByText(/Build Muscle/i);
      fireEvent.press(goal);
      
      const continueButton = getByText(/Continue/i);
      fireEvent.press(continueButton);
      
      await waitFor(() => {
        expect(EnhancedAnalyticsService.trackGoalSelected).toHaveBeenCalled();
      });
    });
  });

  describe('Fitness Assessment Screen', () => {
    test('should display fitness level options', () => {
      const { getByText } = render(<FitnessAssessmentScreen />);
      
      expect(getByText(/Let's assess your fitness/i)).toBeTruthy();
      expect(getByText(/Beginner/i)).toBeTruthy();
      expect(getByText(/Intermediate/i)).toBeTruthy();
      expect(getByText(/Advanced/i)).toBeTruthy();
    });

    test('should display workout frequency options', () => {
      const { getByText } = render(<FitnessAssessmentScreen />);
      
      expect(getByText(/How often do you want to work out/i)).toBeTruthy();
      expect(getByText(/2.*days\/week/i)).toBeTruthy();
      expect(getByText(/3.*days\/week/i)).toBeTruthy();
    });

    test('should track fitness assessment completion', async () => {
      const { getByText } = render(<FitnessAssessmentScreen />);
      
      // Select fitness level
      const intermediate = getByText(/Intermediate/i);
      fireEvent.press(intermediate);
      
      // Select workout frequency
      const fourDays = getByText(/4.*days\/week/i);
      fireEvent.press(fourDays);
      
      const continueButton = getByText(/Continue/i);
      fireEvent.press(continueButton);
      
      await waitFor(() => {
        expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
          'fitness_level_set',
          expect.objectContaining({
            fitness_level: 'intermediate',
            workout_frequency: 4,
          })
        );
      });
    });
  });

  describe('Personalization Screen', () => {
    test('should display personalization options', () => {
      const { getByText, getByPlaceholderText } = render(<PersonalizationScreen />);
      
      expect(getByText(/Let's personalize your experience/i)).toBeTruthy();
      expect(getByText(/Gender/i)).toBeTruthy();
      expect(getByPlaceholderText(/Enter your age/i)).toBeTruthy();
    });

    test('should allow skipping optional fields', () => {
      const { getByText } = render(<PersonalizationScreen />);
      
      const skipButton = getByText(/Skip/i);
      expect(skipButton).toBeTruthy();
      
      fireEvent.press(skipButton);
      
      expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
        'personalization_skipped',
        expect.any(Object)
      );
    });

    test('should save personalization data', async () => {
      const { getByText, getByPlaceholderText } = render(<PersonalizationScreen />);
      
      // Select gender
      const maleButton = getByText(/Male/i);
      fireEvent.press(maleButton);
      
      // Enter age
      const ageInput = getByPlaceholderText(/Enter your age/i);
      fireEvent.changeText(ageInput, '25');
      
      const continueButton = getByText(/Continue/i);
      fireEvent.press(continueButton);
      
      await waitFor(() => {
        expect(SupabaseAnalyticsService.saveUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            gender: 'male',
            age: 25,
          })
        );
      });
    });
  });

  describe('Plan Selection Screen', () => {
    test('should display loading state while generating plans', async () => {
      const { getByText } = render(<PlanSelectionScreen />);
      
      expect(getByText(/Creating your personalized plans/i)).toBeTruthy();
      
      await waitFor(() => {
        expect(getByText(/Choose Your Plan/i)).toBeTruthy();
      }, { timeout: 3000 });
    });

    test('should display AI-generated plan', async () => {
      const { getByText } = render(<PlanSelectionScreen />);
      
      await waitFor(() => {
        expect(getByText(/AI Personalized Plan/i)).toBeTruthy();
        expect(getByText(/Custom plan tailored/i)).toBeTruthy();
      });
    });

    test('should track plan selection', async () => {
      const { getByText } = render(<PlanSelectionScreen />);
      
      await waitFor(() => {
        const aiPlan = getByText(/AI Personalized Plan/i);
        fireEvent.press(aiPlan);
      });
      
      expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
        'plan_selected',
        expect.objectContaining({
          plan_id: 'ai_personalized',
        })
      );
    });
  });

  describe('Tutorial Screen', () => {
    test('should display tutorial steps', () => {
      const { getByText } = render(<TutorialScreen />);
      
      expect(getByText(/Your Dashboard/i)).toBeTruthy();
      expect(getByText(/Track your progress/i)).toBeTruthy();
    });

    test('should track gesture completions', async () => {
      const { getByText } = render(<TutorialScreen />);
      
      const tapArea = getByText(/Tap here to try/i);
      fireEvent.press(tapArea);
      
      await waitFor(() => {
        expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
          'tutorial_gesture_completed',
          expect.objectContaining({
            gesture_type: 'tap',
          })
        );
      });
    });

    test('should complete onboarding flow', async () => {
      const { getByText } = render(<TutorialScreen />);
      
      // Navigate through tutorial
      const nextButton = getByText(/Next/i);
      
      // Go through all steps
      for (let i = 0; i < 7; i++) {
        fireEvent.press(nextButton);
      }
      
      const letsGoButton = getByText(/Let's Go!/i);
      fireEvent.press(letsGoButton);
      
      await waitFor(() => {
        expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
          'tutorial_completed',
          expect.any(Object)
        );
        expect(EnhancedAnalyticsService.track).toHaveBeenCalledWith(
          'onboarding_completed',
          expect.any(Object)
        );
      });
    });
  });

  describe('Complete Onboarding Flow', () => {
    test('should track funnel progression', async () => {
      const { getByText, getByPlaceholderText } = render(<OnboardingNavigator />);
      
      // Welcome Screen
      await act(async () => {
        const getStarted = getByText(/Get Started/i);
        fireEvent.press(getStarted);
      });
      
      // Goal Selection
      await waitFor(() => {
        const buildMuscle = getByText(/Build Muscle/i);
        fireEvent.press(buildMuscle);
        
        const continueGoals = getByText(/Continue/i);
        fireEvent.press(continueGoals);
      });
      
      // Fitness Assessment
      await waitFor(() => {
        const intermediate = getByText(/Intermediate/i);
        fireEvent.press(intermediate);
        
        const fourDays = getByText(/4.*days\/week/i);
        fireEvent.press(fourDays);
        
        const continueAssessment = getByText(/Continue/i);
        fireEvent.press(continueAssessment);
      });
      
      // Verify funnel tracking
      expect(EnhancedAnalyticsService.trackFunnelStep).toHaveBeenCalledTimes(3);
    });

    test('should save complete user profile', async () => {
      const userId = 'test_user_123';
      await SupabaseAnalyticsService.initialize(userId);
      
      // Complete onboarding
      await SupabaseAnalyticsService.completeOnboarding(300, 'premium_plan');
      
      expect(SupabaseAnalyticsService.updateUserProfile).toHaveBeenCalledWith({
        onboarding_completed: true,
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network error
      jest.spyOn(SupabaseAnalyticsService, 'trackEvent').mockRejectedValueOnce(
        new Error('Network error')
      );
      
      const { getByText } = render(<OnboardingNavigator />);
      
      // Should still work offline
      const getStarted = getByText(/Get Started/i);
      fireEvent.press(getStarted);
      
      // Events should be queued
      await waitFor(() => {
        expect(SupabaseAnalyticsService['queueEvent']).toHaveBeenCalled();
      });
    });

    test('should validate user input', () => {
      const { getByPlaceholderText, getByText } = render(<PersonalizationScreen />);
      
      // Enter invalid age
      const ageInput = getByPlaceholderText(/Enter your age/i);
      fireEvent.changeText(ageInput, 'abc');
      
      const continueButton = getByText(/Continue/i);
      fireEvent.press(continueButton);
      
      // Should not proceed with invalid input
      expect(SupabaseAnalyticsService.saveUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('A/B Testing Integration', () => {
    test('should apply button color variants', async () => {
      const { getByText } = render(<OnboardingNavigator />);
      
      const button = getByText(/Get Started/i);
      const buttonStyle = button.props.style;
      
      // Should have a background color from A/B test
      expect(buttonStyle).toBeDefined();
    });

    test('should track A/B test conversions', async () => {
      const { getByText } = render(<PlanSelectionScreen />);
      
      await waitFor(() => {
        const subscribeButton = getByText(/Start 7-Day Free Trial/i);
        fireEvent.press(subscribeButton);
      });
      
      expect(SupabaseAnalyticsService.trackABTestConversion).toHaveBeenCalled();
    });
  });
});