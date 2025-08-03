import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openaiService } from '../services/openaiService';
import { wearableService } from '../services/wearableService';
import { config } from '../config';

interface ConnectionStatus {
  openai: boolean;
  wearables: { [key: string]: boolean };
  configValid: boolean;
}

const ConnectionTester: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    openai: false,
    wearables: {},
    configValid: false
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkConfigValidation();
  }, []);

  const checkConfigValidation = () => {
    const isValid = config.validateConfig();
    setStatus(prev => ({ ...prev, configValid: isValid }));
    
    if (!isValid) {
      console.warn('Missing environment variables detected');
    }
  };

  const testConnections = async () => {
    setTesting(true);
    
    try {
      // Test OpenAI connection
      const openaiStatus = await openaiService.testConnection();
      
      // Test wearable connections
      const wearableStatus = await wearableService.testConnections();
      
      setStatus({
        openai: openaiStatus,
        wearables: wearableStatus,
        configValid: config.validateConfig()
      });

      // Show results
      const results = [
        `OpenAI: ${openaiStatus ? '✅ Connected' : '❌ Failed'}`,
        `WHOOP: ${wearableStatus.whoop ? '✅ Ready' : '❌ No API Key'}`,
        `Apple Watch: ${wearableStatus.apple ? '✅ Ready' : '❌ Not Available'}`,
        `Garmin: ${wearableStatus.garmin ? '✅ Ready' : '❌ No Client ID'}`,
        `Fitbit: ${wearableStatus.fitbit ? '✅ Ready' : '❌ No Config'}`
      ].join('\n');

      Alert.alert('Connection Test Results', results);
    } catch (error) {
      console.error('Connection test error:', error);
      Alert.alert('Error', 'Failed to test connections');
    }
    
    setTesting(false);
  };

  const testAIFeatures = async () => {
    try {
      // Test AI insights generation
      const testMetrics = {
        strain: 8.5,
        recovery: 65,
        sleep: 7.2,
        hrv: 42,
        recentWorkouts: []
      };

      const insights = await openaiService.generateHealthInsights(testMetrics);
      const recommendation = await openaiService.generateWorkoutRecommendation(testMetrics);

      Alert.alert(
        'AI Test Results',
        `Generated ${insights.length} insights and workout recommendation successfully!`
      );
    } catch (error) {
      console.error('AI test error:', error);
      Alert.alert('AI Test Failed', 'Check console for details');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Status</Text>
      
      <View style={styles.statusItem}>
        <Ionicons 
          name={status.configValid ? 'checkmark-circle' : 'alert-circle'} 
          size={20} 
          color={status.configValid ? '#10B981' : '#EF4444'} 
        />
        <Text style={styles.statusText}>
          Environment Config: {status.configValid ? 'Valid' : 'Missing Variables'}
        </Text>
      </View>

      <View style={styles.statusItem}>
        <Ionicons 
          name={status.openai ? 'checkmark-circle' : 'help-circle'} 
          size={20} 
          color={status.openai ? '#10B981' : '#F59E0B'} 
        />
        <Text style={styles.statusText}>
          OpenAI API: {status.openai ? 'Connected' : 'Not Tested'}
        </Text>
      </View>

      <Text style={styles.subtitle}>Wearable Services:</Text>
      {Object.entries(status.wearables).map(([device, connected]) => (
        <View key={device} style={styles.statusItem}>
          <Ionicons 
            name={connected ? 'checkmark-circle' : 'close-circle'} 
            size={16} 
            color={connected ? '#10B981' : '#6B7280'} 
          />
          <Text style={styles.deviceText}>
            {device.toUpperCase()}: {connected ? 'Ready' : 'Not Available'}
          </Text>
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.testButton, testing && styles.testButtonDisabled]} 
          onPress={testConnections}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? 'Testing...' : 'Test Connections'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testAIFeatures}
        >
          <Text style={styles.testButtonText}>Test AI Features</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginTop: 12,
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    color: '#D1D5DB',
    marginLeft: 8,
    fontSize: 14,
  },
  deviceText: {
    color: '#9CA3AF',
    marginLeft: 8,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 16,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default ConnectionTester;