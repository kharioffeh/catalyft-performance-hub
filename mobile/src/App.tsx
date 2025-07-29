import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import ExampleComponent from 'src/components/ExampleComponent';
import Config from 'react-native-config';
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.NODE_ENV,
});

export default function App() {
  // Example: Access environment variables (remove these logs in production)
  console.log('Config.SUPABASE_URL:', Config.SUPABASE_URL);
  console.log('🔍 Sentry DSN:', Config.SENTRY_DSN ? 'Configured ✅' : 'Not configured ❌');
  console.log('🌍 Environment:', Config.NODE_ENV);
  
  // Test crash function for Sentry
  const testSentryCrash = () => {
    Alert.alert(
      'Test Sentry Crash',
      'This will throw an error to test Sentry crash reporting. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test Crash', 
          style: 'destructive',
          onPress: () => {
            // Add breadcrumb before crash
            Sentry.addBreadcrumb({
              message: 'User triggered test crash',
              level: 'info',
              category: 'user_action'
            });
            
            // Throw test error
            throw new Error('🧪 Sentry Test Crash - Integration Working!');
          }
        }
      ]
    );
  };

  // Test Sentry message (non-crash)
  const testSentryMessage = () => {
    Sentry.captureMessage('🧪 Test message from Sentry integration', 'info');
    Alert.alert('Test Message Sent', 'Check your Sentry dashboard for the test message!');
  };
  
  return (
    <View style={styles.container} testID="appContainer">
      <Text style={styles.title} testID="appTitle">Catalyft Mobile App</Text>
      <Text style={styles.subtitle} testID="appSubtitle">
        React Native with TypeScript, ESLint, and Prettier
      </Text>
      <Text style={styles.envText} testID="envStatus">
        Environment: {Config.SUPABASE_URL ? 'Configured' : 'Not configured'}
      </Text>
      <Text style={styles.envText}>
        Sentry: {Config.SENTRY_DSN ? '✅ Active' : '❌ Not configured'}
      </Text>
      
      {/* Sentry Test Buttons */}
      <View style={styles.testContainer}>
        <Text style={styles.testTitle}>🧪 Sentry Integration Test</Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="Test Sentry Message" 
            onPress={testSentryMessage}
            color="#4F46E5"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button 
            title="Test Crash Report" 
            onPress={testSentryCrash}
            color="#DC2626"
          />
        </View>
      </View>
      
      <ExampleComponent title="Welcome to Catalyft!" />
      <StatusBar style="auto" />
    </View>
  );
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
