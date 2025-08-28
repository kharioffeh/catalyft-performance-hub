import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import * as Sentry from '@sentry/react-native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { validateConfig } from './config';
import firebaseService from './config/firebase';
import ErrorBoundary from './services/errorBoundary';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,
});

function App(): React.JSX.Element {
  useEffect(() => {
    // Validate configuration on app start
    const isConfigValid = validateConfig();
    if (!isConfigValid && __DEV__) {
      console.warn('Some environment variables are missing. Check your .env file.');
    }

    // Initialize Firebase
    const initializeFirebase = async () => {
      try {
        await firebaseService.initialize();
        console.log('✅ Firebase initialized successfully');
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
      }
    };

    initializeFirebase();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(App);