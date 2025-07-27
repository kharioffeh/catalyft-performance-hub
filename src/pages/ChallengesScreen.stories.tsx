import React from 'react';
import ChallengesScreen from './ChallengesScreen';
import { BrowserRouter } from 'react-router-dom';

// Mock the Supabase client for Storybook
const mockSupabase = {
  functions: {
    invoke: async (functionName: string) => {
      if (functionName === 'getChallenges') {
        return {
          data: {
            challenges: [
              {
                id: '1',
                title: '30-Day Fitness Challenge',
                description: 'Complete daily workouts for 30 consecutive days to build a lasting fitness habit',
                start_date: '2024-01-01',
                end_date: '2024-01-31',
                joinCount: 145,
                userProgress: 65,
                isJoined: true
              },
              {
                id: '2',
                title: 'Marathon Training',
                description: 'Train for your first marathon with our structured 16-week program',
                start_date: '2024-02-01',
                end_date: '2024-05-15',
                joinCount: 89,
                userProgress: null,
                isJoined: false
              },
              {
                id: '3',
                title: 'Weight Loss Journey',
                description: 'Join thousands in our 12-week weight loss challenge with nutrition and exercise',
                start_date: '2024-01-15',
                end_date: '2024-04-15',
                joinCount: 234,
                userProgress: 23,
                isJoined: true
              },
              {
                id: '4',
                title: 'Strength Building',
                description: 'Build muscle and increase strength with progressive overload training',
                start_date: '2024-02-10',
                end_date: '2024-05-10',
                joinCount: 76,
                userProgress: null,
                isJoined: false
              }
            ]
          },
          error: null
        };
      }
      return { data: null, error: null };
    }
  }
};

// Mock the useToast hook
const mockToast = {
  toast: () => {}
};

// Mock story components for demonstration
export const Default = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-gradient-cosmic">
      <ChallengesScreen />
    </div>
  </BrowserRouter>
);

export const MockedChallenges = () => {
  // This would typically be handled by mocking the Supabase client
  // For demo purposes, showing the component structure
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-cosmic">
        <ChallengesScreen />
      </div>
    </BrowserRouter>
  );
};