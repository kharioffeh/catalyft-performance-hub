import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

export default function App() {
  const testAlert = () => {
    Alert.alert('Hello!', 'Your Expo Go app is working! 🎉');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalyft Performance Hub</Text>
      <Text style={styles.subtitle}>Mobile App</Text>
      
      <View style={styles.section}>
        <Text style={styles.text}>Welcome to your Expo app!</Text>
        <Text style={styles.text}>This is running in Expo Go 📱</Text>
      </View>

      <Button
        title="Test App"
        onPress={testAlert}
        color="#007AFF"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Built with React Native & Expo</Text>
      </View>

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
