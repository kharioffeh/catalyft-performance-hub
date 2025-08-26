import { Platform } from 'react-native';
import Config from 'react-native-config';

// Import Firebase modules
import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';

/**
 * Firebase Configuration
 * The actual configuration comes from:
 * - iOS: GoogleService-Info.plist
 * - Android: google-services.json
 * - Web: Environment variables
 */

// For web platform (if needed in future)
const webConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
  measurementId: Config.FIREBASE_MEASUREMENT_ID,
};

class FirebaseService {
  private static instance: FirebaseService;
  private initialized = false;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if Firebase is already initialized
      if (!firebase.apps.length) {
        // For React Native, Firebase auto-initializes with native config files
        // No need to manually initialize for iOS/Android
        console.log('Firebase auto-initialized with native config');
      }

      // Enable Analytics collection
      await analytics().setAnalyticsCollectionEnabled(!__DEV__);

      // Enable Crashlytics
      await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);

      // Enable Performance Monitoring
      await perf().setPerformanceCollectionEnabled(!__DEV__);

      // Set default user properties
      await this.setDefaultUserProperties();

      this.initialized = true;
      console.log('✅ Firebase services initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      // Don't throw - app should work without Firebase
    }
  }

  private async setDefaultUserProperties(): Promise<void> {
    try {
      await analytics().setUserProperties({
        platform: Platform.OS,
        app_version: '1.0.0',
        environment: __DEV__ ? 'development' : 'production',
      });
    } catch (error) {
      console.error('Error setting default user properties:', error);
    }
  }

  // Analytics methods
  async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error(`Error logging event ${eventName}:`, error);
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      await analytics().setUserId(userId);
      await crashlytics().setUserId(userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  async setUserProperty(name: string, value: string): Promise<void> {
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error(`Error setting user property ${name}:`, error);
    }
  }

  // Crashlytics methods
  async logError(error: Error, context?: string): Promise<void> {
    try {
      if (context) {
        crashlytics().log(context);
      }
      await crashlytics().recordError(error);
    } catch (err) {
      console.error('Error logging to Crashlytics:', err);
    }
  }

  async setAttribute(key: string, value: string): Promise<void> {
    try {
      await crashlytics().setAttribute(key, value);
    } catch (error) {
      console.error(`Error setting attribute ${key}:`, error);
    }
  }

  // Performance methods
  async startTrace(traceName: string): Promise<any> {
    try {
      const trace = await perf().startTrace(traceName);
      return trace;
    } catch (error) {
      console.error(`Error starting trace ${traceName}:`, error);
      return null;
    }
  }

  // Screen tracking
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
    } catch (error) {
      console.error(`Error logging screen view ${screenName}:`, error);
    }
  }

  // Standard events
  async logLogin(method: string): Promise<void> {
    await this.logEvent('login', { method });
  }

  async logSignUp(method: string): Promise<void> {
    await this.logEvent('sign_up', { method });
  }

  async logSelectContent(contentType: string, itemId: string): Promise<void> {
    await this.logEvent('select_content', {
      content_type: contentType,
      item_id: itemId,
    });
  }

  async logShare(contentType: string, itemId: string, method: string): Promise<void> {
    await this.logEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method,
    });
  }

  async logPurchase(value: number, currency: string, transactionId: string): Promise<void> {
    await this.logEvent('purchase', {
      value,
      currency,
      transaction_id: transactionId,
    });
  }

  async logBeginCheckout(value: number, currency: string, items: any[]): Promise<void> {
    await this.logEvent('begin_checkout', {
      value,
      currency,
      items,
    });
  }

  // App-specific events
  async logOnboardingBegin(): Promise<void> {
    await this.logEvent('tutorial_begin');
  }

  async logOnboardingComplete(): Promise<void> {
    await this.logEvent('tutorial_complete');
  }

  async logWorkoutStart(workoutType: string): Promise<void> {
    await this.logEvent('workout_start', { workout_type: workoutType });
  }

  async logWorkoutComplete(workoutType: string, duration: number): Promise<void> {
    await this.logEvent('workout_complete', {
      workout_type: workoutType,
      duration_seconds: duration,
    });
  }
}

export const firebaseService = FirebaseService.getInstance();

// Initialize Firebase when the module is imported
firebaseService.initialize().catch(console.error);

export default firebaseService;