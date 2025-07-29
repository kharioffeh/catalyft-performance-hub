import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ExampleComponent from 'src/components/ExampleComponent';
import Config from 'react-native-config';

export default function App() {
  // Example: Access environment variables (remove these logs in production)
  console.log('Config.SUPABASE_URL:', Config.SUPABASE_URL);
  
  return (
    <View style={styles.container} testID="appContainer">
      <Text style={styles.title} testID="appTitle">Catalyft Mobile App</Text>
      <Text style={styles.subtitle} testID="appSubtitle">
        React Native with TypeScript, ESLint, and Prettier
      </Text>
      <Text style={styles.envText} testID="envStatus">
        Environment: {Config.SUPABASE_URL ? 'Configured' : 'Not configured'}
      </Text>
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
});
