import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///',
  writeAsStringAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn(),
}));

// Mock Firebase
jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(),
  setUserId: jest.fn(),
  setUserProperties: jest.fn(),
}));

jest.mock('@react-native-firebase/crashlytics', () => () => ({
  recordError: jest.fn(),
  log: jest.fn(),
  setUserId: jest.fn(),
  setAttribute: jest.fn(),
  setAttributes: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(),
}));

jest.mock('@react-native-firebase/perf', () => () => ({
  startTrace: jest.fn(() => ({
    putAttribute: jest.fn(),
    stop: jest.fn(),
  })),
  startHttpMetric: jest.fn(() => ({
    putAttribute: jest.fn(),
    setHttpResponseCode: jest.fn(),
    setRequestPayloadSize: jest.fn(),
    setResponsePayloadSize: jest.fn(),
    stop: jest.fn(),
  })),
  setPerformanceCollectionEnabled: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-config
jest.mock('react-native-config', () => ({
  SEGMENT_WRITE_KEY: 'test_segment_key',
  MIXPANEL_TOKEN: 'test_mixpanel_token',
  FIREBASE_API_KEY: 'test_firebase_key',
}));

// Mock Supabase
jest.mock('./src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test_user_id' } } }),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Global test utilities
global.__DEV__ = true;