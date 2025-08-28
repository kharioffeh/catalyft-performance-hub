import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Catalyft App is Running!</Text>
      <Text style={{ fontSize: 16, marginTop: 20 }}>✅ Configuration Loaded</Text>
    </View>
  );
}