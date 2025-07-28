import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ExampleComponent from 'src/components/ExampleComponent';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalyft Mobile App</Text>
      <Text style={styles.subtitle}>
        React Native with TypeScript, ESLint, and Prettier
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
});
