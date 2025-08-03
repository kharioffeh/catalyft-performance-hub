import React from 'react';
import { StyleSheet } from 'react-native';
import Config from 'react-native-config';
import * as Sentry from '@sentry/react-native';
import AppNavigator from './navigation/AppNavigator';

// Initialize Sentry
Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.NODE_ENV,
});

export default function App() {
  // Log environment status (remove in production)
  console.log('🔍 Sentry DSN:', Config.SENTRY_DSN ? 'Configured ✅' : 'Not configured ❌');
  console.log('🌍 Environment:', Config.NODE_ENV);
  console.log('🏠 Supabase URL:', Config.SUPABASE_URL ? 'Configured ✅' : 'Not configured ❌');
  
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  envText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#444',
    textAlign: 'center',
  },
  testContainer: {
    width: '100%',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 10,
  },
});
