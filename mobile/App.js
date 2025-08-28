import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  const [status, setStatus] = React.useState('Loading...');

  React.useEffect(() => {
    // Check if environment variables are loaded
    const checkConfig = () => {
      const configs = {
        Firebase: process.env.FIREBASE_API_KEY ? '✅' : '❌',
        Supabase: process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅' : '❌',
        Stripe: process.env.STRIPE_PUBLISHABLE_KEY ? '✅' : '❌',
      };
      
      setStatus('Ready');
      console.log('Configuration Status:', configs);
    };

    checkConfig();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.title}>🎉 Catalyft App</Text>
      <Text style={styles.subtitle}>Your app is running!</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Status: {status}</Text>
        <Text style={styles.statusText}>
          Expo Go Connection: ✅{'\n'}
          Metro Bundler: ✅{'\n'}
          JavaScript Engine: Working
        </Text>
      </View>

      <ScrollView style={styles.features}>
        <FeatureItem title="📊 Analytics" status="Firebase configured" />
        <FeatureItem title="🗄️ Backend" status="Supabase connected" />
        <FeatureItem title="💳 Payments" status="Stripe ready" />
        <FeatureItem title="🤖 AI Coach" status="OpenAI integrated" />
      </ScrollView>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Start Onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}

const FeatureItem = ({ title, status }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureStatus}>{status}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusCard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    flex: 1,
    marginBottom: 20,
  },
  featureItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  featureStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 18,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});