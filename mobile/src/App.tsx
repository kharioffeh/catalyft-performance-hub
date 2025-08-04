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
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  section: {
    alignItems: 'center',
    marginBottom: 30,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#444',
  },
  footer: {
    marginTop: 50,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
