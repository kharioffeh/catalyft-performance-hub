import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Linking } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import AuthHandler from './components/AuthHandler';
import Config from 'react-native-config';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.NODE_ENV,
});

export default function App() {
  const [isProcessingAuth, setIsProcessingAuth] = React.useState(false);

  React.useEffect(() => {
    // Handle deep links for magic link authentication
    const handleDeepLink = (url: string) => {
      if (url.includes('catalyft://auth/magic-link')) {
        setIsProcessingAuth(true);
      }
    };

    // Listen for deep links
    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      linkingListener?.remove();
    };
  }, []);

  const handleAuthComplete = () => {
    setIsProcessingAuth(false);
  };

  return (
    <View style={styles.container} testID="appContainer">
      {/* Title for E2E smoke test */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>CataLyft</Text>
      </View>
      
      <AppNavigator />
      
      <AuthHandler 
        isProcessing={isProcessingAuth}
        onAuthComplete={handleAuthComplete}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
});
