import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface AuthHandlerProps {
  isProcessing: boolean;
  onAuthComplete: () => void;
}

export default function AuthHandler({ isProcessing, onAuthComplete }: AuthHandlerProps) {
  React.useEffect(() => {
    if (isProcessing) {
      // Simulate authentication processing
      const timer = setTimeout(() => {
        onAuthComplete();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessing, onAuthComplete]);

  if (!isProcessing) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container} testID="magic-link-processing">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.title}>Verifying your account...</Text>
        <Text style={styles.subtitle}>Please wait while we authenticate your magic link</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});