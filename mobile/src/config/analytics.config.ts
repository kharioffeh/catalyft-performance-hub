import Config from 'react-native-config';

export const AnalyticsConfig = {
  segment: {
    writeKey: Config.SEGMENT_WRITE_KEY || '',
    flushInterval: 20,
    trackAppLifecycleEvents: true,
    trackAttributionData: true,
    trackDeepLinks: true,
    recordScreenViews: true,
    debug: __DEV__,
  },
  
  mixpanel: {
    token: Config.MIXPANEL_TOKEN || '',
    trackAutomaticEvents: true,
    serverURL: 'https://api.mixpanel.com',
    flushInterval: 60,
    enableLogging: __DEV__,
  },
  
  amplitude: {
    apiKey: Config.AMPLITUDE_API_KEY || '',
    trackingOptions: {
      disableCookies: true,
      disableCarrier: false,
      disableIPAddress: false,
    },
    enableCoppaControl: false,
    flushQueueSize: 30,
    flushIntervalMillis: 30000,
  },
  
  firebase: {
    apiKey: Config.FIREBASE_API_KEY,
    authDomain: Config.FIREBASE_AUTH_DOMAIN,
    projectId: Config.FIREBASE_PROJECT_ID,
    storageBucket: Config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
    appId: Config.FIREBASE_APP_ID,
    measurementId: Config.FIREBASE_MEASUREMENT_ID,
  },
  
  crashlytics: {
    enabled: Config.CRASHLYTICS_ENABLED !== 'false',
    debug: Config.CRASHLYTICS_DEBUG === 'true',
    collectCrashReports: true,
    collectPerformanceMetrics: true,
  },
  
  appStore: {
    iosAppId: Config.IOS_APP_ID || '',
    androidPackageName: Config.ANDROID_PACKAGE_NAME || '',
  },
};

// Analytics event name validation
export const ValidateEventName = (eventName: string): boolean => {
  // Event names should be snake_case and not exceed 40 characters
  const pattern = /^[a-z][a-z0-9_]{0,39}$/;
  return pattern.test(eventName);
};

// Property validation
export const ValidateProperties = (properties: Record<string, any>): boolean => {
  // Check for valid property types and sizes
  for (const [key, value] of Object.entries(properties)) {
    if (key.length > 40) return false;
    if (typeof value === 'string' && value.length > 1000) return false;
    if (Array.isArray(value) && value.length > 100) return false;
  }
  return true;
};