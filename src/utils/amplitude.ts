// Platform-agnostic Amplitude utility
import * as AmplitudeBrowser from '@amplitude/analytics-browser';

// For web applications, we use the browser SDK
export const Amplitude = AmplitudeBrowser;

let isInitialized = false;

// Initialize Amplitude for web with EU configuration
export const initAmplitude = () => {
  if (isInitialized) return;
  
  const apiKey = import.meta.env.VITE_AMPLITUDE_KEY;
  if (apiKey) {
    try {
      Amplitude.init(apiKey, undefined, {
        serverZone: 'EU'
      });
      isInitialized = true;
      console.log('✅ Amplitude initialized for web with EU servers');
    } catch (error) {
      console.error('❌ Failed to initialize Amplitude:', error);
    }
  } else {
    console.warn('⚠️ VITE_AMPLITUDE_KEY not found - Amplitude not initialized');
  }
};

// Safe track function with error handling
export const track = (eventName: string, properties?: Record<string, any>) => {
  try {
    if (isInitialized) {
      Amplitude.track(eventName, properties);
    } else {
      console.warn('⚠️ Amplitude not initialized, skipping track:', eventName);
    }
  } catch (error) {
    console.error('❌ Amplitude track error:', error);
  }
};

// Export other functions for consistency
export const identify = Amplitude.identify;
export const Identify = Amplitude.Identify;

export default Amplitude;