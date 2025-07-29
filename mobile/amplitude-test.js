// Simple Amplitude Test for React Native
import * as Amplitude from '@amplitude/react-native';

// Test configuration
const API_KEY = '66624db952fc361bc9725432f210ab90';

// Initialize Amplitude
Amplitude.init(API_KEY, undefined, {
  serverZone: 'EU'
});

// Test functions
export const testAmplitudeIntegration = () => {
  console.log('Testing Amplitude Integration...');
  
  // Test 1: App Launch Event
  Amplitude.track('App Launched');
  console.log('✅ App Launched event sent');
  
  // Test 2: Workout Completed Event
  const mockSessionId = 'test-session-' + Date.now();
  Amplitude.track('Workout Completed', { sessionId: mockSessionId });
  console.log('✅ Workout Completed event sent with sessionId:', mockSessionId);
  
  console.log('Check your Amplitude EU dashboard for these events!');
};

// Auto-run test
setTimeout(() => {
  testAmplitudeIntegration();
}, 2000);